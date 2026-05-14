CREATE SEQUENCE IF NOT EXISTS products_id_seq START 1;

CREATE TABLE products (
    id BIGINT NOT NULL DEFAULT nextval('products_id_seq'),
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    price DOUBLE PRECISION NOT NULL,
    stock INTEGER NOT NULL,
    category VARCHAR(255),
    image_url TEXT,
    unit VARCHAR(255),
    store_id BIGINT NOT NULL,
    status VARCHAR(255) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    PRIMARY KEY (id),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    CHECK (status IN ('AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED'))
);