CREATE SEQUENCE IF NOT EXISTS notifications_id_seq START 1;

CREATE TABLE users_notification (
    id BIGINT NOT NULL DEFAULT nextval('notifications_id_seq'),
    user_id BIGINT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    order_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id)
);