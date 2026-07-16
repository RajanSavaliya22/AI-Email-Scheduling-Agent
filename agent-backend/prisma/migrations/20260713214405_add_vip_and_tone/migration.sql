-- AlterTable
ALTER TABLE "Preference" ADD COLUMN     "tonePreference" TEXT NOT NULL DEFAULT 'professional';

-- CreateTable
CREATE TABLE "VipContact" (
    "id" TEXT NOT NULL,
    "preferenceId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "label" TEXT,

    CONSTRAINT "VipContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VipContact_preferenceId_email_key" ON "VipContact"("preferenceId", "email");

-- AddForeignKey
ALTER TABLE "VipContact" ADD CONSTRAINT "VipContact_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "Preference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
