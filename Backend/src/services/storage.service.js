const ImageKit = require("imagekit");
const mongoose = require("mongoose");


const imagekit = new ImageKit({
  publicKey: process.env.publicKey,
  privateKey: process.env.privateKey,
  urlEndpoint: process.env.urlEndpoint,
});

function uploadfile(file) {
  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file: file.buffer, // required
        fileName: new mongoose.Types.ObjectId().toString(), // required
        folder:"MusicFiles"
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
}

module.exports = uploadfile;
