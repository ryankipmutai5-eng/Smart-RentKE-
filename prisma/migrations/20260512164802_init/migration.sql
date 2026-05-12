-- CreateTable
CREATE TABLE "Landlord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "payhero_api_key" TEXT,
    "payhero_merchant_id" TEXT,
    "whatsapp_api_token" TEXT,
    "whatsapp_instance_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "landlord_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "house_number" TEXT NOT NULL,
    "rent_amount" REAL NOT NULL,
    "due_date" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Tenant_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "Landlord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "landlord_id" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "service_fee" REAL NOT NULL DEFAULT 20.0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payhero_reference" TEXT,
    "external_reference" TEXT,
    "paid_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Payment_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "Landlord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Landlord_email_key" ON "Landlord"("email");
