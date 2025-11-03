const mongoose = require("mongoose");

const musicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    artist: {
      type: String,
      required: true,
    },
    artistid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    musicurl: {
      type: String,
      required: true,
    },
    coverimageurl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Musicmodel = mongoose.model("Music", musicSchema);

module.exports = Musicmodel;
