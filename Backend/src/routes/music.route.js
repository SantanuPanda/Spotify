const express = require("express");
const multer = require("multer");
const muisccontroller = require("../controllers/music.controller");
const authMiddleware= require("../middlewares/auth.middleware");
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

router.get("/",authMiddleware.authUserMiddleware,muisccontroller.getAllMusic);

router.post("/upload",authMiddleware.authArtistMiddleware, upload.fields([{ name: "musicurl", maxCount: 1 }, { name: "coverimageurl", maxCount: 1 }]), muisccontroller.uploadMusic);

router.get("/artist-music",authMiddleware.authArtistMiddleware, muisccontroller.getMusic);
router.post("/create-playlist",authMiddleware.authArtistMiddleware, muisccontroller.createPlaylist);
router.get("/artist-playlists",authMiddleware.authArtistMiddleware, muisccontroller.getArtistPlaylists);
router.get("/playlists",authMiddleware.authUserMiddleware, muisccontroller.getPlaylists);
router.get("/playlist/:id",authMiddleware.authUserMiddleware, muisccontroller.getPlaylistsByID);
router.get("/get-details/:id",authMiddleware.authUserMiddleware, muisccontroller.getMusicDetailsByID);

// Delete music by ID
router.delete("/delete-music/:id",authMiddleware.authArtistMiddleware, muisccontroller.deleteMusic);
// Delete playlist by ID
router.delete("/delete-playlist/:id",authMiddleware.authArtistMiddleware, muisccontroller.deletePlaylist);


module.exports = router;
