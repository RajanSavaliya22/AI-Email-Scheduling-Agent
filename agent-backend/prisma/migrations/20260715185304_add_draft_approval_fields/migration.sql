-- AlterTable
ALTER TABLE "CalendarEvent" ADD COLUMN     "googleEventId" TEXT;

-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "editedReply" TEXT,
ADD COLUMN     "sentAt" TIMESTAMP(3);
