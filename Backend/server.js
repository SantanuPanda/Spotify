require('dotenv').config();
const app=require('./src/app');
const connectDB=require('./src/db/db');
const {connectToRabbitMQ}=require('./src/broker/rabbit');
const initsocketServer=require('./src/sockets/socket.server');

// Initialize Socket.io server
const http = require('http');
const server = http.createServer(app);
initsocketServer(server);

// Connect to RabbitMQ
connectToRabbitMQ();
connectDB();

server.listen(3000,()=>{
    console.log("Backend service is running on port 3000 [http://localhost:3000 ]");
});