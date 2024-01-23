CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified TIMESTAMPTZ,
    image TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS databases (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    db_name VARCHAR(255) PRIMARY KEY,
    db_user VARCHAR(255) NOT NULL,
    db_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id VARCHAR(255) NOT NULL,
    provider_type VARCHAR(255) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    access_token TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    token_type VARCHAR(255),
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    PRIMARY KEY (user_id, provider_id)
);

CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier VARCHAR(255) PRIMARY KEY,
    token TEXT NOT NULL,
    expires TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_sessions (
    id SERIAL PRIMARY KEY,
    expires TIMESTAMPTZ NOT NULL,
    session_token TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_logs (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    command_type VARCHAR(255) NOT NULL,
    command TEXT NOT NULL,
    duration FLOAT NOT NULL,
    count INT NOT NULL DEFAULT 1,
    created_at DATE NOT NULL DEFAULT CURRENT_DATE,
    PRIMARY KEY (user_id, command, created_at)
);

CREATE TABLE IF NOT EXISTS database_logs (
    database_id VARCHAR(255) NOT NULL REFERENCES databases(db_name) ON DELETE CASCADE,
    database_size INT NOT NULL,
    created_at DATE NOT NULL DEFAULT CURRENT_DATE,
    PRIMARY KEY (database_id, created_at)
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS databases_user_id_idx ON databases(user_id);
CREATE INDEX IF NOT EXISTS accounts_provider_id_idx ON accounts(provider_id);
CREATE INDEX IF NOT EXISTS accounts_provider_account_id_idx ON accounts(provider_account_id);
CREATE INDEX IF NOT EXISTS verification_tokens_identifier_idx ON verification_tokens(identifier);
CREATE INDEX IF NOT EXISTS sessions_session_token_idx ON auth_sessions(session_token);
CREATE INDEX IF NOT EXISTS user_logs_user_id_idx ON user_logs(user_id);
CREATE INDEX IF NOT EXISTS database_logs_database_id_idx ON database_logs(database_id);
