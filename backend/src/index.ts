import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route"
import userRoutes from './routes/user.route';
import messageRoutes from './routes/message.route';
import chatRoutes from './routes/chat.route';

dotenv.config();
const PORT = process.env.PORT || 8000;

const app = express();
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/chat', chatRoutes);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
})
