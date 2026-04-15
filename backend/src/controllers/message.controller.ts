import express, { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { io, userSocketMap } from '..';

export const getAllMsgs = async (req: Request, res: Response) => {
  try {
    const currUser = req.user;
    // console.log('body:', req.body);
    // console.log('query:', req.query);
    // console.log('params:', req.params);
    const chatId = req.params.chatid as string;

    if (!currUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!chatId) {
      return res.status(400).json({ error: 'chatId is required' });
    }

    const userId = currUser.id;

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        users: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!chat) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profilePic: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.status(200).json({ msg: 'Messages fetched successfully', messages });
  } catch (err: any) {
    console.log('Error in getting all msgs', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createNewMsg = async (req: Request, res: Response) => {
  try {
    const currUser = req.user;
    const { chatId, content } = req.body;

    // Auth check first
    if (!currUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!chatId) {
      return res.status(400).json({ error: 'chatId is required' });
    }

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const userId = currUser.id;

    // Check user belongs to chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        users: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!chat) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create message
    const newMsg = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        chatId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profilePic: true,
          },
        },
      },
    });

    // Update chat timestamp (important for sorting chats)
    await prisma.chat.update({
      where: { id: chatId },
      data: {
        updatedAt: new Date(),
      },
    });

    // Get all users in chat
    const chatWithDetails = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            username: true,
            fullName: true,
            profilePic: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
            sender: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    // safety check
    if (!chatWithDetails) {
      return res.status(500).json({ error: 'Chat not found after message creation' });
    }

    // FORMAT FUNCTION (PER USER)
    const formatChatForUser = (chat: any, currentUserId: string) => {
      const lastMessage = chat.messages?.[0] || null;

      if (!chat.isGroup) {
        const otherUser = chat.users.find(
          (u: any) => u.id !== currentUserId
        );

        return {
          id: chat.id,
          createdAt: chat.createdAt,
          isGroup: false,
          otherUser,
          updatedAt: chat.updatedAt,
          lastMessage,
        };
      }

      const members = chat.users.filter((u: any) => u.id !== currentUserId);

      return {
        id: chat.id,
        createdAt: chat.createdAt,
        isGroup: true,
        name: chat.name,
        members,
        updatedAt: chat.updatedAt,
        lastMessage,
      };
    };

    // EMIT TO ALL USERS (INCLUDING SENDER)
    chatWithDetails.users.forEach((user) => {
      if (user.id === userId) return;
      const socketId = userSocketMap.get(user.id);

      if (!socketId) return;

      // format per user
      const formattedChat = formatChatForUser(chatWithDetails, user.id);

      console.log('Sending to user:', user.id);
      console.log('Socket found:', socketId);

      io.to(socketId).emit('newMessage', {
        message: newMsg,
        chat: formattedChat,
      });
    });

    res.status(201).json({
      message: 'Message created successfully',
      newMsg,
    });
  } catch (err: any) {
    console.log('Error in creating message', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
