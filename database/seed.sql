/**
    Insert one row for testing.
*/

USE test;

INSERT INTO users (email, password, fullname) VALUES (
    'cdi@codemagnus.com',
    PASSWORD(CONCAT(MD5('cdip4sSw0rd'), 'NaCl')),
    'Juan dela Cruz'
);
