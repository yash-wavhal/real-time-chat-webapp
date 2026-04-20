import { PrismaClient, Gender } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

// async function main() {
//   // 🔐 hash password once
//   const salt = await bcryptjs.genSalt(10);
//   const hashedPassword = await bcryptjs.hash('abcd', salt);

//   // 👤 USERS
//   await prisma.user.createMany({
//     data: [
//       {
//         id: 'u1',
//         username: 'user1',
//         email: 'user1@gmail.com',
//         fullName: 'User One',
//         password: hashedPassword,
//         gender: Gender.male,
//       },
//       {
//         id: 'u2',
//         username: 'user2',
//         email: 'user2@gmail.com',
//         fullName: 'User Two',
//         password: hashedPassword,
//         gender: Gender.female,
//       },
//       {
//         id: 'u3',
//         username: 'user3',
//         email: 'user3@gmail.com',
//         fullName: 'User Three',
//         password: hashedPassword,
//         gender: Gender.male,
//       },
//       {
//         id: 'u4',
//         username: 'user4',
//         email: 'user4@gmail.com',
//         fullName: 'User Four',
//         password: hashedPassword,
//         gender: Gender.female,
//       },
//       {
//         id: 'u5',
//         username: 'user5',
//         email: 'user5@gmail.com',
//         fullName: 'User Five',
//         password: hashedPassword,
//         gender: Gender.male,
//       },
//       {
//         id: 'u6',
//         username: 'user6',
//         email: 'user6@gmail.com',
//         fullName: 'User Six',
//         password: hashedPassword,
//         gender: Gender.female,
//       },
//     ],
//     skipDuplicates: true, // ✅ important
//   });

//   // 💬 CHATS

//   await prisma.chat.create({
//     data: {
//       id: 'c1',
//       isGroup: true,
//       name: 'Group Chat 1',
//       users: {
//         connect: [{ id: 'u1' }, { id: 'u2' }, { id: 'u3' }],
//       },
//     },
//   });

//   await prisma.chat.create({
//     data: {
//       id: 'c2',
//       isGroup: true,
//       name: 'Group Chat 2',
//       users: {
//         connect: [{ id: 'u4' }, { id: 'u5' }, { id: 'u6' }],
//       },
//     },
//   });

//   await prisma.chat.create({
//     data: {
//       id: 'c3',
//       isGroup: false,
//       users: {
//         connect: [{ id: 'u1' }, { id: 'u4' }],
//       },
//     },
//   });

//   await prisma.chat.create({
//     data: {
//       id: 'c4',
//       isGroup: false,
//       users: {
//         connect: [{ id: 'u2' }, { id: 'u5' }],
//       },
//     },
//   });

//   await prisma.chat.create({
//     data: {
//       id: 'c5',
//       isGroup: false,
//       users: {
//         connect: [{ id: 'u3' }, { id: 'u6' }],
//       },
//     },
//   });

//   // 📩 MESSAGES

//   await prisma.message.createMany({
//     data: [
//       {
//         content: 'Hello from u1',
//         senderId: 'u1',
//         chatId: 'c1',
//       },
//       {
//         content: 'Hi from u2',
//         senderId: 'u2',
//         chatId: 'c1',
//       },
//       {
//         content: 'Group chat here',
//         senderId: 'u3',
//         chatId: 'c1',
//       },
//       {
//         content: 'Hey u4',
//         senderId: 'u1',
//         chatId: 'c3',
//       },
//       {
//         content: 'Hello u1',
//         senderId: 'u4',
//         chatId: 'c3',
//       },
//       {
//         content: 'Private chat',
//         senderId: 'u2',
//         chatId: 'c4',
//       },
//       {
//         content: 'Reply from u5',
//         senderId: 'u5',
//         chatId: 'c4',
//       },
//       {
//         content: 'Chat c5 message',
//         senderId: 'u3',
//         chatId: 'c5',
//       },
//     ],
//   });

//   // 🔄 Trigger updatedAt for chats
//   const chatIds = ['c1', 'c2', 'c3', 'c4', 'c5'];

//   for (const id of chatIds) {
//     await prisma.chat.update({
//       where: { id },
//       data: {},
//     });
//   }

//   console.log('✅ Seed data inserted successfully');
// }

// main()
//   .catch((e) => {
//     console.error('❌ Error in seed:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

async function main() {
  const chats = await prisma.chat.findMany({
    include: {
      usersOld: true,
    },
  });

  for (const chat of chats) {
    for (const user of chat.usersOld) {
      await prisma.chatUser.upsert({
        where: {
          userId_chatId: {
            userId: user.id,
            chatId: chat.id,
          },
        },
        update: {}, // do nothing if exists
        create: {
          chatId: chat.id,
          userId: user.id,
          lastReadAt: new Date(),
        },
      });
    }
  }

  // console.log('Migration complete');
}

main()
  .catch((e) => {
    // console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
