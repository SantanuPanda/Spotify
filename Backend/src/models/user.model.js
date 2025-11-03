const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fullname: {
      firstname: { type: String, required: true },
      lastname: { type: String, required: true },
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // ✅ works properly here
      },
      select: false,
    },
    googleId: { type: String, },
    role: {
      type: String,
      enum: ["user", "artist"],
      default: "user",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
