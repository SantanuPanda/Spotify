const { body, validationResult } = require("express-validator");

async function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const validateRegistration = [
  body("email")
    .matches(emailRegex)
    .withMessage("Please enter a valid email address")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("firstname")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 3 })
    .withMessage("First name must be at least 3 characters long"),

  body("lastname")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 3 })
    .withMessage("Last name must be at least 3 characters long"),

  body("password")
    .if(body("googleId").not().exists()) // password required only if googleId not present
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("role")
    .optional()
    .isIn(["user", "artist"])
    .withMessage("Role must be either 'User' or 'Artist'"),
  validate,
];

const validateLogin = [
  body("email")
    .matches(emailRegex)
    .withMessage("Please enter a valid email address")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
];

module.exports = { validateRegistration, validateLogin };
