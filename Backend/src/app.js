const express=require('express');
const cookieParser=require('cookie-parser');
const morgan=require('morgan');
const userRoutes=require('./routes/user.route');
const musicRoutes=require('./routes/music.route');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const cors = require('cors');

const app=express();
app.set('trust proxy', 1); // VERY IMPORTANT for Render/HTTPS


app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(morgan('dev'));

// Debug middleware - logs cookies on every request
app.use((req, res, next) => {
  console.log('📨 Incoming request:', req.method, req.path);
  console.log('🍪 Cookies received:', Object.keys(req.cookies).length > 0 ? req.cookies : 'None');
  console.log('🌍 Origin:', req.get('origin') || 'No origin header');
  next();
});

app.use('/api/auth', userRoutes);
app.use('/api/music', musicRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the Spotify App API');
});


// Configure Passport to use Google OAuth 2.0 strategy
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));


module.exports=app;