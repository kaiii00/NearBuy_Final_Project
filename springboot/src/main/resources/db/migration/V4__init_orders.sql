CREATE SEQUENCE IF NOT EXISTS orders_id_seq START 1;

CREATE TABLE orders (
    id BIGINT NOT NULL DEFAULT nextval('orders_id_seq'),
    buyer_id BIGINT NOT NULL,
    store_id BIGINT NOT NULL,
    status VARCHAR(255) NOT NULL,
    delivery_address VARCHAR(255) NOT NULL,
    delivery_notes VARCHAR(255),
    total_amount DOUBLE PRECISION NOT NULL,
    delivery_fee DOUBLE PRECISION,
    estimated_delivery_time TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    PRIMARY KEY (id),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    CHECK (status IN (
        'PENDING',
        'CONFIRMED',
        'PREPARING',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED'
    ))
);