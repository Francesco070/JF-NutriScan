-- CreateTable
CREATE TABLE "account" (
    "user_id" BIGSERIAL NOT NULL,
    "firstname" VARCHAR(100) NOT NULL,
    "lastname" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "profileimg" BYTEA,

    CONSTRAINT "account_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "product" (
    "product_id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255),
    "barcode" VARCHAR(32) NOT NULL,
    "brand" VARCHAR(255),
    "imageUrl" TEXT,
    "imageIngredientsUrl" TEXT,
    "imageNutritionUrl" TEXT,
    "ingredients" TEXT,
    "allergens" TEXT,
    "nutriscore_grade" CHAR(1),
    "nutriscore_score" INTEGER,
    "serving_size" VARCHAR(50),
    "serving_quantity" DOUBLE PRECISION,
    "serving_unitBasis" VARCHAR(20),
    "energyKj100g" INTEGER,
    "energyKcal100g" INTEGER,
    "energyKcalServing" INTEGER,
    "proteins100g" DOUBLE PRECISION,
    "carbs100g" DOUBLE PRECISION,
    "fat100g" DOUBLE PRECISION,
    "saturatedFat100g" DOUBLE PRECISION,
    "sugars100g" DOUBLE PRECISION,
    "fiber100g" DOUBLE PRECISION,
    "salt100g" DOUBLE PRECISION,
    "sodium100g" DOUBLE PRECISION,

    CONSTRAINT "product_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "scanned_product" (
    "scanned_product_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "scanDate" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scanned_product_pkey" PRIMARY KEY ("scanned_product_id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "user_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("user_id","product_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_email_key" ON "account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "product_barcode_key" ON "product"("barcode");

-- CreateIndex
CREATE INDEX "idx_scanned_product_user_id" ON "scanned_product"("user_id");

-- CreateIndex
CREATE INDEX "idx_scanned_product_product_id" ON "scanned_product"("product_id");

-- CreateIndex
CREATE INDEX "idx_favorites_product_id" ON "favorites"("product_id");

-- AddForeignKey
ALTER TABLE "scanned_product" ADD CONSTRAINT "scanned_product_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "account"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scanned_product" ADD CONSTRAINT "scanned_product_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "account"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;
