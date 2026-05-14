CREATE SEQUENCE IF NOT EXISTS ratings_id_seq START 1;

CREATE TABLE ratings (
    id BIGINT NOT NULL DEFAULT nextval('ratings_id_seq'),
    user_id BIGINT NOT NULL,
    store_id BIGINT NOT NULL,
    rating INTEGER,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE (user_id, store_id),
    CHECK (rating BETWEEN 1 AND 5)
);