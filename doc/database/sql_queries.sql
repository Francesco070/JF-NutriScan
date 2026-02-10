-- ACCOUNT
CREATE TABLE account (
    user_id     BIGSERIAL PRIMARY KEY,
    firstname   VARCHAR(100) NOT NULL,
    lastname    VARCHAR(100) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    profileImg  BYTEA
);

-- PRODUCT
CREATE TABLE product (
    product_id           BIGSERIAL PRIMARY KEY,
    name                 VARCHAR(255),
    barcode              VARCHAR(32) UNIQUE NOT NULL,
    brand                VARCHAR(255),
    imageUrl             TEXT,
    imageIngredientsUrl  TEXT,
    imageNutritionUrl    TEXT,
    ingredients          TEXT,
    allergens            TEXT,
    nutriscore_grade     CHAR(1),
    nutriscore_score     INT,
    serving_size         VARCHAR(50),
    serving_quantity     REAL,
    serving_unitBasis    VARCHAR(20),
    energyKj100g         INT,
    energyKcal100g       INT,
    energyKcalServing    INT,
    proteins100g         REAL,
    carbs100g            REAL,
    fat100g              REAL,
    saturatedFat100g     REAL,
    sugars100g           REAL,
    fiber100g            REAL,
    salt100g             REAL,
    sodium100g           REAL
);

-- SCANNED PRODUCT (scan history)
CREATE TABLE scanned_product (
    scanned_product_id  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL,
    product_id          BIGINT NOT NULL,
    scanDate            TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_scanned_product_user
        FOREIGN KEY (user_id) REFERENCES account(user_id) ON DELETE CASCADE,

    CONSTRAINT fk_scanned_product_product
        FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE
);

-- FAVORITES (many-to-many bridge)
CREATE TABLE favorites (
    user_id     BIGINT NOT NULL,
    product_id  BIGINT NOT NULL,

    PRIMARY KEY (user_id, product_id),

    CONSTRAINT fk_favorites_user
        FOREIGN KEY (user_id) REFERENCES account(user_id) ON DELETE CASCADE,

    CONSTRAINT fk_favorites_product
        FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_scanned_product_user_id ON scanned_product(user_id);
CREATE INDEX idx_scanned_product_product_id ON scanned_product(product_id);
CREATE INDEX idx_favorites_product_id ON favorites(product_id);
