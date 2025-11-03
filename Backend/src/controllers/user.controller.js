const usermodel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const { publishToQueue } = require("../broker/rabbit");
const jwt = require("jsonwebtoken");
const redisClient = require("../db/redis");

// ------------------ REGISTER ------------------
const registerUser = async (req, res) => {
  try {
    const { firstname, lastname, email, password, role } = req.body;

    // check existing user
    const existingUser = await usermodel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newuser = await usermodel.create({
      email,
      fullname: { firstname, lastname },
      password: hashedPassword,
      role,
    });

    publishToQueue("USER_REGISTERED", {
      id: newuser._id,
      email: newuser.email,
      fullname: newuser.fullname,
      role: newuser.role,
    });

    res.status(201).json({
      message: "User registered successfully",
      RegUser: {
        id: newuser._id,
        email: newuser.email,
        fullname: newuser.fullname,
        role: newuser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ------------------ GOOGLE AUTH ------------------
async function googleAuthCallback(req, res) {
  const userProfile = req.user;
  try {
    const existingUser = await usermodel.findOne({
      $or: [
        { googleId: userProfile.id },
        { email: userProfile.emails[0].value },
      ],
    });

    if (existingUser) {
      const token = jwt.sign(
        {
          id: existingUser._id,
          email: existingUser.email,
          fullname: existingUser.fullname,
          role: existingUser.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      // Set cookie
      
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      };

      if (process.env.NODE_ENV === 'production') {
        cookieOptions.domain = '.onrender.com';
      }

      res.cookie("authtoken", token, cookieOptions);
      

      if (existingUser.role=="artist") {
        return res.redirect(`${process.env.FRONTEND_URL}/artist/dashboard`);
      }
      // Redirect to frontend home page instead of returning JSON
      return res.redirect(`${process.env.FRONTEND_URL}/`);
    }

    // If user doesn't exist, create a new user
    const newUser = await usermodel.create({
      email: userProfile.emails[0].value,
      fullname: {
        firstname: userProfile.name.givenName,
        lastname: userProfile.name.familyName,
      },
      googleId: userProfile.id,
    });

    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        fullname: newUser.fullname,
        role: newUser.role,
        googleId: newUser.googleId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    publishToQueue("USER_REGISTERED", {
      id: newUser._id,
      email: newUser.email,
      fullname: newUser.fullname,
      role: newUser.role,
      googleId: newUser.googleId,
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    };

    if (process.env.NODE_ENV === 'production') {
      cookieOptions.domain = '.onrender.com';
    }

    res.cookie("authtoken", token, cookieOptions);
    
    
    // Redirect to frontend home page instead of returning JSON
    return res.redirect(`${process.env.FRONTEND_URL}/`);
  } catch (error) {
    console.error("Google auth error:", error);
  }
}

// ------------------ LOGIN ------------------
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await usermodel.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ message: "User not found" });

    // compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    console.log("🍪 Login - Setting cookie for user:", user.email);
    console.log("🔑 Token generated (first 20 chars):", token.substring(0, 20));
    console.log("🔐 Using JWT_SECRET (hash):", require('crypto').createHash('md5').update(process.env.JWT_SECRET).digest('hex'));
    console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
    console.log("🔒 Cookie secure:", process.env.NODE_ENV === 'production');
    console.log("🍪 Cookie sameSite:", process.env.NODE_ENV === 'production' ? 'none' : 'lax');

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    };

    // In production on Render, set domain to share cookie across subdomains
    if (process.env.NODE_ENV === 'production') {
      cookieOptions.domain = '.onrender.com';
    }

    res.cookie("authtoken", token, cookieOptions);

    console.log("✅ Cookie set successfully with domain:", cookieOptions.domain || 'default');
    
    res.status(200).json({
      message: "Login successful",
      redirectUrl: user.role === "artist" ? "/artist/dashboard" : "/",
      loginuser: {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ------------------ LOGOUT ------------------
const logoutUser = async (req, res) => {
  const authtoken = req.cookies.authtoken;
  if (!authtoken) {
    return res.status(400).json({ message: "No active session" });
  }
  try {
    await redisClient.set(
      `blacklist:${authtoken}`,
      true,
      "EX",
      2 * 24 * 60 * 60
    ); // expire in 2 days

    const clearOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    };

    if (process.env.NODE_ENV === 'production') {
      clearOptions.domain = '.onrender.com';
    }

    res.clearCookie("authtoken", clearOptions);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ------------------ GET CURRENT USER ------------------
const getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies.authtoken;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const user = await usermodel.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      id: user._id,
      email: user.email,
      fullname: user.fullname,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { registerUser, loginUser, logoutUser, googleAuthCallback, getCurrentUser };
