import express from 'express';
import http from 'http';
import dotenv from 'dotenv';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import messageRoutes from './routes/message.route';
import chatRoutes from './routes/chat.route';
import { Server } from 'socket.io';

dotenv.config();
const PORT = process.env.PORT || 8000;

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  // Creating the websocket server
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
});

// use io to:
// Listen for connections
// Emit events globally
// Manage users
const userSocketMap = new Map<string, string>();
io.on('connection', (socket) => {
  // Here it runs if any user sends a connection request and that socket is pointed to that user
  // console.log('socket', socket);
  console.log('User connected to server: ', socket.id);

  const userId = socket.handshake.query.userId as string;
  if (!userId) return;

  userSocketMap.set(userId, socket.id);
  console.log('User:', userId, 'Socket:', socket.id);

  // socket.on('sendMessage', (data) => {
  //   console.log('Message received from frontend:', data);

  //   const receiverSocketId = userSocketMap.get(data.receiverId);

  //   if (receiverSocketId) {
  //     io.to(receiverSocketId).emit('newMessage', {
  //       text: data.text,
  //     });
  //   }
  // });

  socket.on('disconnect', () => {
    userSocketMap.delete(userId);
  });
});

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/chat', chatRoutes);

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

export { io, userSocketMap };
