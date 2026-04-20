/*
  Warnings:

  - You are about to drop the `_chatUsers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_chatUsers" DROP CONSTRAINT "_chatUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "_chatUsers" DROP CONSTRAINT "_chatUsers_B_fkey";

-- DropTable
DROP TABLE "_chatUsers";
