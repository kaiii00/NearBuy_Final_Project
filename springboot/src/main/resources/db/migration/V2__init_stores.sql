CREATE SEQUENCE IF NOT EXISTS stores_id_seq START 1;

CREATE TABLE stores (
    id BIGINT NOT NULL DEFAULT nextval('stores_id_seq'),
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    address VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    barangay VARCHAR(255),
    contact_number VARCHAR(255),
    image_url TEXT,
    owner_id BIGINT NOT NULL,
    status VARCHAR(255) NOT NULL,
    delivery_fee DOUBLE PRECISION,
    minimum_order DOUBLE PRECISION,
    estimated_delivery_minutes INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    PRIMARY KEY (id),
    CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
);