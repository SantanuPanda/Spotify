const JWT=require('jsonwebtoken');

async function authArtistMiddleware(req,res,next){
    try {
        const token=req.cookies.authtoken || req.header('Authorization')?.replace('Bearer ','');
        
        if(!token){
            console.log('❌ No token provided in request');
            console.log('   Cookies:', req.cookies);
            console.log('   Authorization header:', req.header('Authorization'));
            return res.status(401).json({message:"No token provided"});
        }

        console.log('🔑 Token received (first 20 chars):', token.substring(0, 20));
        console.log('🔐 Using JWT_SECRET (hash):', require('crypto').createHash('md5').update(process.env.JWT_SECRET).digest('hex'));
        
        const decoded=JWT.verify(token,process.env.JWT_SECRET);
        
        if (decoded.role!== "artist") {
          console.log('❌ Access denied: User is not an artist');
          return res.status(403).json({message:"Access denied"});
        }
        
        console.log('✅ Token verified successfully');
        console.log('   User ID:', decoded.id);
        console.log('   User email:', decoded.email);
        console.log('   User role:', decoded.role);
        
        req.user=decoded;
        req.user._id=decoded.id;
        next();
    } catch (error) {
        console.log('❌ Token verification failed!');
        console.log('   Error name:', error.name);
        console.log('   Error message:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            console.log('   🚨 This usually means JWT_SECRET mismatch between services!');
        } else if (error.name === 'TokenExpiredError') {
            console.log('   🕐 Token has expired');
        }
        
        res.status(401).json({message:"Invalid token", error: error.name});
    }
}

async function authUserMiddleware(req, res, next) {
    try {
        const token = req.cookies.authtoken || req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            console.log('❌ No token provided in request');
            console.log('   Cookies:', req.cookies);
            console.log('   Authorization header:', req.header('Authorization'));
            return res.status(401).json({ message: "No token provided" });
        }

        console.log('🔑 Token received (first 20 chars):', token.substring(0, 20));
        console.log('🔐 Using JWT_SECRET (hash):', require('crypto').createHash('md5').update(process.env.JWT_SECRET).digest('hex'));
        
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        
        console.log('✅ Token verified successfully');
        console.log('   User ID:', decoded.id);
        console.log('   User email:', decoded.email);
        console.log('   User role:', decoded.role);
        
        req.user = decoded;
        next();
    } catch (error) {
        console.log('❌ Token verification failed!');
        console.log('   Error name:', error.name);
        console.log('   Error message:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            console.log('   🚨 This usually means JWT_SECRET mismatch between services!');
        } else if (error.name === 'TokenExpiredError') {
            console.log('   🕐 Token has expired');
        }
        
        res.status(401).json({ message: "Invalid token", error: error.name });
    }
}

module.exports = { authArtistMiddleware, authUserMiddleware };
