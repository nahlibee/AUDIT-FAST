

-- Insert roles if they don't exist
INSERT INTO roles (name, description)
SELECT 'ROLE_ADMIN', 'Administrator role with full access'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_ADMIN');

INSERT INTO roles (name, description)
SELECT 'ROLE_MANAGER', 'Manager role with elevated access'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_MANAGER');

INSERT INTO roles (name, description)
SELECT 'ROLE_AUDITOR', 'Auditor role with read-only access'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_AUDITOR');

-- Create admin user if not exists
INSERT INTO users (username, email, password, first_name, last_name, account_enabled, date_of_birth, phone_number)
SELECT 'admin', 'admin@example.com', '$2a$12$SgjmSf48D0NioWKudaxi/ekJm0VcjXxRTV.hGtxim78C8nFMeoDnq', 'Admin', 'User', true, '1990-01-01', '+1234567890'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- Create manager user if not exists
INSERT INTO users (username, email, password, first_name, last_name, account_enabled, date_of_birth, phone_number)
SELECT 'manager', 'manager@example.com', '$2a$12$SgjmSf48D0NioWKudaxi/ekJm0VcjXxRTV.hGtxim78C8nFMeoDnq', 'Manager', 'User', true, '1990-01-01', '+1234567891'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'manager');

-- Create auditor user if not exists
INSERT INTO users (username, email, password, first_name, last_name, account_enabled, date_of_birth, phone_number)
SELECT 'auditor', 'auditor@example.com', '$2a$12$SgjmSf48D0NioWKudaxi/ekJm0VcjXxRTV.hGtxim78C8nFMeoDnq', 'Auditor', 'User', true, '1990-01-01', '+1234567892'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'auditor');

-- Assign admin role to admin user if not already assigned
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'ROLE_ADMIN'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Assign manager role to manager user if not already assigned
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'manager' AND r.name = 'ROLE_MANAGER'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Assign auditor role to auditor user if not already assigned
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'auditor' AND r.name = 'ROLE_AUDITOR'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
); 