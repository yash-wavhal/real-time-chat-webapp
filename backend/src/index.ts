import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "../routes/auth.route"

dotenv.config();
const PORT = process.env.PORT || 8000;

const app = express();
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
// app.use('/api/user', userRoutes);
// app.use('/api/message', messageRoutes);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
})
