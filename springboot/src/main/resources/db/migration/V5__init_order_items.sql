CREATE SEQUENCE IF NOT EXISTS order_items_id_seq START 1;

CREATE TABLE order_items (
    id BIGINT NOT NULL DEFAULT nextval('order_items_id_seq'),
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DOUBLE PRECISION NOT NULL,
    subtotal DOUBLE PRECISION NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);