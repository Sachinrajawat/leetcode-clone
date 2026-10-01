const express = require('express')
const app= express()
require('dotenv').config();
const main = require('./config/db')
const cookieParser = require('cookie-parser');
const authRouter = require("./routes/authRouter");
const problemRouter = require('./routes/problemRouter')
const redisClient = require('./config/redis');
const submitRouter = require("./routes/submitRouter")
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173', // Replace with your exact Vite URL
  credentials: true, // This allows the backend to accept and send cookies
}));
app.use(express.json());
app.use(cookieParser());

app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);


const initializeConnection = async ()=>{
    try {
        await Promise.all([main(), redisClient.connect()]);
        console.log("DB Connected");
        app.listen(process.env.PORT, ()=>{
            console.log("Server listening at port number: "+process.env.PORT);
        })
    } catch (error) {
        console.log("Error: "+error);
    }
}

initializeConnection();