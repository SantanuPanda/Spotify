const express=require('express');
const app=express();
const sendEmail=require('./utils/email');

app.use(express.json());


module.exports=app;