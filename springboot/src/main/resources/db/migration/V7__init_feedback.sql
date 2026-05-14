CREATE SEQUENCE IF NOT EXISTS feedback_id_seq START 1;

CREATE TABLE feedback (
    id BIGINT NOT NULL DEFAULT nextval('feedback_id_seq'),
    user_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE (user_id, order_id)
);