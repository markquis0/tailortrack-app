/*
  Warnings:

  - You are about to drop the `appointments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `clients` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `measurements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `timers` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('tailor', 'client');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('scheduled', 'completed', 'canceled');

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_client_id_fkey";

-- DropForeignKey
ALTER TABLE "measurements" DROP CONSTRAINT "measurements_client_id_fkey";

-- DropForeignKey
ALTER TABLE "timers" DROP CONSTRAINT "timers_client_id_fkey";

-- DropTable
DROP TABLE "appointments";

-- DropTable
DROP TABLE "clients";

-- DropTable
DROP TABLE "measurements";

-- DropTable
DROP TABLE "timers";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "tailorId" TEXT,
    "clientUserId" TEXT,
    "storeName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Measurement" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "chest" DOUBLE PRECISION,
    "overarm" DOUBLE PRECISION,
    "waist" DOUBLE PRECISION,
    "hipSeat" DOUBLE PRECISION,
    "neck" DOUBLE PRECISION,
    "arm" DOUBLE PRECISION,
    "pantOutseam" DOUBLE PRECISION,
    "pantInseam" DOUBLE PRECISION,
    "coatInseam" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "coatSize" TEXT,
    "pantSize" TEXT,
    "dressShirtSize" TEXT,
    "shoeSize" TEXT,
    "materialPreference" TEXT,
    "dateTaken" TIMESTAMP(3),
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Measurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timer" (
    "id" TEXT NOT NULL,
    "tailorId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Timer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Client_tailorId_idx" ON "Client"("tailorId");

-- CreateIndex
CREATE INDEX "Client_clientUserId_idx" ON "Client"("clientUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_clientUserId_key" ON "Client"("clientUserId");

-- CreateIndex
CREATE INDEX "Measurement_clientId_idx" ON "Measurement"("clientId");

-- CreateIndex
CREATE INDEX "Measurement_updatedById_idx" ON "Measurement"("updatedById");

-- CreateIndex
CREATE UNIQUE INDEX "Measurement_clientId_key" ON "Measurement"("clientId");

-- CreateIndex
CREATE INDEX "Appointment_clientId_idx" ON "Appointment"("clientId");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "Timer_tailorId_idx" ON "Timer"("tailorId");

-- CreateIndex
CREATE INDEX "Timer_clientId_idx" ON "Timer"("clientId");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_tailorId_fkey" FOREIGN KEY ("tailorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timer" ADD CONSTRAINT "Timer_tailorId_fkey" FOREIGN KEY ("tailorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timer" ADD CONSTRAINT "Timer_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
