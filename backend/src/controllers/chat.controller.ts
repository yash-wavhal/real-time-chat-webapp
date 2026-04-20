import express, { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getAllChats = async (req: Request, res: Response) => {
  try {
    const currUser = req.user;

    if (!currUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = currUser.id;

    const chats = await prisma.chat.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            lastSeen: true,
            username: true,
            fullName: true,
            profilePic: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
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
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const formattedChats = chats.map((chat) => {
      const lastMessage = chat.messages[0] || null;

      if (!chat.isGroup) {
        const otherUser = chat.users.find((u) => u.id !== userId);

        return {
          id: chat.id,
          createdAt: chat.createdAt,
          isGroup: false,
          otherUser,
          updatedAt: chat.updatedAt,
          lastMessage,
        };
      }

      const otherUsers = chat.users.filter((u) => u.id !== userId);

      return {
        id: chat.id,
        createdAt: chat.createdAt,
        isGroup: true,
        name: chat.name,
        members: otherUsers,
        updatedAt: chat.updatedAt,
        lastMessage,
      };
    });

    res.status(200).json({ msg: 'Chats fetched successfully!', formattedChats });
  } catch (err: any) {
    console.log('Error in getting all chats', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createNewChat = async (req: Request, res: Response) => {
  try {
    const currUser = req.user;

    if (!currUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { memberIds, name } = req.body;
    if (memberIds.length === 0) {
      return res.status(400).json({
        error: 'At least one member required',
      });
    }
    if (memberIds.length > 1 && !name) {
      return res.status(400).json({
        error: 'Group name is required',
      });
    }

    const userId = currUser.id;
    if (memberIds.includes(userId)) {
      return res.status(400).json({ error: 'Cannot chat with yourself' });
    }

    const otherUsers = [...new Set([...memberIds, userId])];

    if (!otherUsers || otherUsers.length === 0) {
      return res.status(400).json({ error: 'otherUsers are required' });
    }

    // Check if other user exists
    const users = await prisma.user.findMany({
      where: {
        id: { in: otherUsers },
      },
    });

    if (users.length !== otherUsers.length) {
      return res.status(404).json({ error: 'Some users not found' });
    }

    // Formatter (same as getAllChats)
    const formatChat = (chat: any) => {
      const lastMessage = chat.messages?.[0] || null;

      if (!chat.isGroup) {
        const otherUser = chat.users.find((u: any) => u.id !== userId);

        return {
          id: chat.id,
          createdAt: chat.createdAt,
          isGroup: false,
          otherUser,
          updatedAt: chat.updatedAt,
          lastMessage,
        };
      }

      const members = chat.users.filter((u: any) => u.id !== userId);

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

    // Check if chat already exists 1-1 chat only
    if (memberIds.length == 1) {
      const existingChat = await prisma.chat.findFirst({
        where: {
          isGroup: false,
          AND: [{ users: { some: { id: userId } } }, { users: { some: { id: memberIds[0] } } }],
        },
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
      // If chat exists → return formatted
      if (existingChat) {
        return res.status(200).json({
          msg: 'Chat already exists',
          chat: formatChat(existingChat),
          isNewChat: false,
        });
      }
    }

    // Create new chat
    const newChat = await prisma.chat.create({
      data: {
        isGroup: memberIds.length > 1,
        name: memberIds.length > 1 ? name : null,
        users: {
          connect: otherUsers.map((id) => ({ id })),
        },
      },
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

    return res.status(200).json({
      msg: 'Chat created successfully!',
      chat: formatChat(newChat),
      isNewChat: true,
    });
  } catch (err: any) {
    console.log('Error in creating new chat', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteChat = async (req: Request, res: Response) => {
  try {
    const currUser = req.user;

    if (!currUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { chatId } = req.body;

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

    await prisma.chat.delete({
      where: { id: chatId },
    });

    return res.status(200).json({
      msg: 'Chat deleted successfully',
    });
  } catch (err: any) {
    console.log('Error in Deleting Chat', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
