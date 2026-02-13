-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL,
    "attemptedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" VARCHAR(320) NOT NULL,
    "ipAddress" VARCHAR(64) NOT NULL,
    "success" BOOLEAN NOT NULL,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LoginAttempt_email_attemptedAt_idx" ON "LoginAttempt"("email", "attemptedAt" DESC);

-- CreateIndex
CREATE INDEX "LoginAttempt_ipAddress_attemptedAt_idx" ON "LoginAttempt"("ipAddress", "attemptedAt" DESC);
