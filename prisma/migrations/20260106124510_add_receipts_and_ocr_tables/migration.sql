-- CreateTable
CREATE TABLE "receipts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipt_ocr_data" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "storeName" TEXT,
    "transactionDate" DATE,
    "totalAmount" INTEGER,
    "taxAmount" INTEGER,
    "paymentMethod" TEXT,
    "items" JSONB NOT NULL DEFAULT '[]',
    "rawText" TEXT,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receipt_ocr_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "receipts_userId_uploadedAt_idx" ON "receipts"("userId", "uploadedAt");

-- CreateIndex
CREATE INDEX "receipts_userId_status_idx" ON "receipts"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "receipt_ocr_data_receiptId_key" ON "receipt_ocr_data"("receiptId");

-- CreateIndex
CREATE INDEX "receipt_ocr_data_receiptId_idx" ON "receipt_ocr_data"("receiptId");

-- CreateIndex
CREATE INDEX "receipt_ocr_data_transactionDate_idx" ON "receipt_ocr_data"("transactionDate");

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_ocr_data" ADD CONSTRAINT "receipt_ocr_data_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
