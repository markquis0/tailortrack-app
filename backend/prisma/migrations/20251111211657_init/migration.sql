-- CreateTable
CREATE TABLE "appointments" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER,
    "title" VARCHAR(100),
    "date" TIMESTAMP(6),
    "location" VARCHAR(100),
    "notes" TEXT,
    "status" VARCHAR(20) DEFAULT 'scheduled',

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100),
    "email" VARCHAR(100),
    "phone" VARCHAR(20),
    "store_name" VARCHAR(100),
    "notes" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurements" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER,
    "chest" DECIMAL,
    "overarm" DECIMAL,
    "waist" DECIMAL,
    "hip_seat" DECIMAL,
    "neck" DECIMAL,
    "arm" DECIMAL,
    "pant_outseam" DECIMAL,
    "pant_inseam" DECIMAL,
    "coat_inseam" DECIMAL,
    "height" DECIMAL,
    "weight" DECIMAL,
    "coat_size" VARCHAR(20),
    "pant_size" VARCHAR(20),
    "dress_shirt_size" VARCHAR(20),
    "shoe_size" VARCHAR(20),
    "material_preference" VARCHAR(50),
    "updated_by" VARCHAR(50),
    "date_taken" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timers" (
    "id" SERIAL NOT NULL,
    "tailor_id" INTEGER,
    "client_id" INTEGER,
    "start_time" TIMESTAMP(6),
    "end_time" TIMESTAMP(6),
    "duration" INTEGER,
    "description" TEXT,

    CONSTRAINT "timers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "timers" ADD CONSTRAINT "timers_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
