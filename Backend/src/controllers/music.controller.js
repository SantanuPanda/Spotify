const Musicmodel=require("../models/music.model");
const Playlistmodel=require("../models/playlist.model");
const uploadfile=require("../services/storage.service");


async function uploadMusic(req,res) {
  try {
    const musicfile=await uploadfile(req.files.musicurl[0]);
    const coverimage=await uploadfile(req.files.coverimageurl[0]);

    const newMusic=new Musicmodel({
      title:req.body.title,
      artist:req.user.fullname.firstname+" "+req.user.fullname.lastname,
      artistid:req.user._id,
      musicurl:musicfile.url,
      coverimageurl:coverimage.url
    });
    await newMusic.save();
    res.status(201).json({message:"Music uploaded successfully",data:newMusic});
  } catch (error) {
    res.status(500).json({message:"Error uploading music",error:error.message});
  }
}

async function getMusic(req, res) {
  try {
    const music = await Musicmodel.find({ artistid: req.user._id });
    if (!music || music.length === 0) {
      return res.status(404).json({ message: "No music found for this artist" });
    }
    res.status(200).json({ message: "Music retrieved successfully",music });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving music", error: error.message });
  }
}

async function createPlaylist(req, res) {
  try {
    const { title, songs } = req.body;
    const newPlaylist = await Playlistmodel.create({
      title,
      artist: req.user.fullname.firstname + " " + req.user.fullname.lastname,
      artistid: req.user._id,
      songs
    });

    res.status(201).json({ message: "Playlist created successfully", data: newPlaylist });
  } catch (error) {
    res.status(500).json({ message: "Error creating playlist", error: error.message });
  }
}

async function getPlaylists(req, res) {
  try {
    console.log(req.user.id);
    
    const playlists = await Playlistmodel.find();
    if (!playlists || playlists.length === 0) {
      return res.status(404).json({ message: "No playlists found for this artist" });
    }
    res.status(200).json({ message: "Playlists retrieved successfully", playlists });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving playlists", error: error.message });
  }
}

async function getAllMusic(req, res) {

 const{skip=0,limit}=req.query;
  try {
    const music = await Musicmodel.find()
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    res.status(200).json({ message: "Music retrieved successfully", music });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving music", error: error.message });
  }
}

async function getPlaylistsByID(req,res) {
  const { id } = req.params;
  try {
    const playlist = await Playlistmodel.findById(id);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    res.status(200).json({ message: "Playlist retrieved successfully", playlist });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving playlist", error: error.message });
  }
}

async function getMusicDetailsByID(req,res) {
  const { id } = req.params;
  try {
    const music = await Musicmodel.findById(id);
    if (!music) {
      return res.status(404).json({ message: "Music not found" });
    }
    res.status(200).json({ message: "Music retrieved successfully", music });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving music", error: error.message });
  }
}

async function getArtistPlaylists(req, res) {
  try {
    const playlists = await Playlistmodel.find({ artistid: req.user.id });
    if (!playlists || playlists.length === 0) {
      return res.status(404).json({ message: "No playlists found for this artist" });
    }
    res.status(200).json({ message: "Playlists retrieved successfully", playlists });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving playlists", error: error.message });
  }
}

async function deleteMusic(req, res) {
  const { id } = req.params;
  try {
    const music = await Musicmodel.findByIdAndDelete(id);
    if (!music) {
      return res.status(404).json({ message: "Music not found" });
    }
    res.status(200).json({ message: "Music deleted successfully", music });
  } catch (error) {
    res.status(500).json({ message: "Error deleting music", error: error.message });
  }
}

async function deletePlaylist(req, res) {
  const { id } = req.params;
  try {
    const playlist = await Playlistmodel.findByIdAndDelete(id);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    res.status(200).json({ message: "Playlist deleted successfully", playlist });
  } catch (error) {
    res.status(500).json({ message: "Error deleting playlist", error: error.message });
  }
}

module.exports={uploadMusic,getMusic,createPlaylist,getPlaylists,getAllMusic,getPlaylistsByID,getMusicDetailsByID,getArtistPlaylists,deleteMusic,deletePlaylist};