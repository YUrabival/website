BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Product] DROP CONSTRAINT [Product_brandId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Product] DROP CONSTRAINT [Product_categoryId_fkey];

-- CreateTable
CREATE TABLE [dbo].[VerificationCode] (
    [id] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [code] NVARCHAR(1000) NOT NULL,
    [expiresAt] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [VerificationCode_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [VerificationCode_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [VerificationCode_email_code_idx] ON [dbo].[VerificationCode]([email], [code]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
