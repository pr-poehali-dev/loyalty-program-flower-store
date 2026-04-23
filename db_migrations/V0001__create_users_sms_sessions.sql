CREATE TABLE t_p45377431_loyalty_program_flow.users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100),
    email VARCHAR(100),
    bonus_points INTEGER DEFAULT 0,
    level VARCHAR(20) DEFAULT 'bronze',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p45377431_loyalty_program_flow.sms_codes (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '10 minutes'),
    used BOOLEAN DEFAULT FALSE
);

CREATE TABLE t_p45377431_loyalty_program_flow.sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES t_p45377431_loyalty_program_flow.users(id),
    token VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days')
);
