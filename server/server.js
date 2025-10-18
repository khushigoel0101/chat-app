import express from "express";
import cors from "cors";
import "dotenv/config";
import http from "http";
import {connectDB} from "./lib/db.js";
import { userInfo } from "os";
import {Server } from "socket.io";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

//creating express app
const app = express();
const server = http.createServer(app)

//socket io setup
export const io = new Server(server, {
    cors: {origin: "*"}
})

// store online users
export const userSocketMap = {}; //{ userId: socketId}

//socket.io connection handler
io.on("connection", (socket)=> {
    const userId = socket.handshake.query.userId;
    console.log("User connected", userId);
    
    if(userId) userSocketMap[userId] = socket.id;

    //emit all users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    socket.on("disconnect", ()=> {
        console.log("User disconnected", userId);
        delete userSocketMap[userId];
        //emit all users to all connected clients
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

//middleware
app.use(express.json({limit: "4mb"}));
app.use(cors());

app.use("/api/status", (req,res)=> res.send("Server is live"))
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

//database connection
await connectDB();


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));