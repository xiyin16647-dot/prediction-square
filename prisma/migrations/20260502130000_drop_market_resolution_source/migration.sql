-- 删除 Market.resolutionSource 字段：判断来源不再录入也不展示，按 category 隐式归类
ALTER TABLE "Market" DROP COLUMN "resolutionSource";
