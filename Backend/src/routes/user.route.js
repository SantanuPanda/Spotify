const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/user.controller');
const {validateRegistration,validateLogin} = require('../middlewares/validation.middleware');


router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback route that Google will redirect to after authentication
router.get('/google/callback',
  passport.authenticate('google', { session: false }),authController.googleAuthCallback
);

// Endpoint to get current authenticated user (reads authtoken cookie)
router.get('/me', authController.getCurrentUser);
router.post('/register',validateRegistration, authController.registerUser);
router.post('/login',validateLogin, authController.loginUser);
router.get('/logout', authController.logoutUser);

module.exports = router;