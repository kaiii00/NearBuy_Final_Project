CREATE SEQUENCE IF NOT EXISTS users_id_seq START 1;

CREATE TABLE users (
    id BIGINT NOT NULL DEFAULT nextval('users_id_seq'),
    username VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'buyer',
    address TEXT,
    contact VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE (username),
    UNIQUE (email)
);