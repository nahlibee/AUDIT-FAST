-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS public;

-- Grant privileges to nahli user
GRANT ALL ON SCHEMA public TO nahli;
GRANT ALL ON ALL TABLES IN SCHEMA public TO nahli;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO nahli;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO nahli;

-- Create enum type for role
CREATE TYPE role AS ENUM ('USER', 'ADMIN');

-- Create tables
CREATE TABLE IF NOT EXISTS _user (
    id SERIAL PRIMARY KEY,
    firstname VARCHAR(50),
    lastname VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role role NOT NULL DEFAULT 'USER'
);

-- Insert default admin user if it doesn't exist
INSERT INTO _user (firstname, lastname, email, password, role)
VALUES ('Admin', 'User', 'admin@example.com', '$2a$10$XURPShQNCsLjp1ESc2laoObo9QZDhxz73hJPaEv7/cBha4pk0AgP.', 'ADMIN')
ON CONFLICT (email) DO NOTHING; 