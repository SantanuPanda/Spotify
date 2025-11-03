const app=require('./src/app');
const dotenv=require('dotenv');
const {connectToRabbitMQ}=require('./src/broker/rabbit');
const startlisten=require('./src/broker/listen');


connectToRabbitMQ().then(startlisten);

app.listen(4000,()=>{
    console.log("Notification service is running on port 4000");
});