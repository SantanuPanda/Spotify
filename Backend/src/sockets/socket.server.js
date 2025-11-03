require("dotenv").config();
const { Server } = require("socket.io");
const JWT=require("jsonwebtoken");
const cookie=require("cookie");

const initsocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization"],
      credentials: true
    }
  });

  io.use((socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const token = cookies.authtoken;
    try {
      const decoded = JWT.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error("Unauthorized"));
    }
  });



  io.on("connection", (socket) => {
    console.log("a user is connected",socket.user.id);
    socket.join(socket.user.id);

    socket.on("play", (data) => {
      const musicId = data.musicId;
      socket.broadcast.to(socket.user.id).emit("play", { musicId });
    });

    socket.on("pause", () => {
      socket.broadcast.to(socket.user.id).emit("pause");
    });

    socket.on("disconnect", () => {
      socket.leave(socket.user.id);
    });
  });

  return io;
};

module.exports = initsocketServer;
