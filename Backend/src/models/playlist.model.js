const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artist: { type: String, required: true },
    artistid: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Music" , required: true }],
  },
  { timestamps: true }
);

const Playlistmodel = mongoose.model("Playlist", playlistSchema);

module.exports = Playlistmodel;
