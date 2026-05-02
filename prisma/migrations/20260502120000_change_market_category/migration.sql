-- AlterEnum: replace MarketCategory values with new design-aligned categories
BEGIN;
CREATE TYPE "MarketCategory_new" AS ENUM ('FINANCE', 'TECH', 'ENTERTAINMENT', 'SPORTS', 'SOCIETY', 'TRENDY', 'OTHER');
ALTER TABLE "Market" ALTER COLUMN "category" TYPE "MarketCategory_new" USING "category"::text::"MarketCategory_new";
ALTER TABLE "NewsSource" ALTER COLUMN "category" TYPE "MarketCategory_new" USING "category"::text::"MarketCategory_new";
ALTER TYPE "MarketCategory" RENAME TO "MarketCategory_old";
ALTER TYPE "MarketCategory_new" RENAME TO "MarketCategory";
DROP TYPE "MarketCategory_old";
COMMIT;
