/*
  Warnings:

  - Added the required column `workLocationId` to the `attendance_records` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attendance_records" ADD COLUMN     "workLocationId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "work_locations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "hourlyRate" INTEGER,
    "dailyRate" INTEGER,
    "projectRate" INTEGER,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "work_locations_userId_idx" ON "work_locations"("userId");

-- CreateIndex
CREATE INDEX "attendance_records_workLocationId_idx" ON "attendance_records"("workLocationId");

-- AddForeignKey
ALTER TABLE "work_locations" ADD CONSTRAINT "work_locations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_workLocationId_fkey" FOREIGN KEY ("workLocationId") REFERENCES "work_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
