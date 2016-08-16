/**
    @rules
        all caps on mysql keywords
        use plural form on table names
        snake case everywhere
        use DATETIME type for dates
        start the column name with `date_` if type is DATETIME, e.g. `date_created`, `date_updated`, `date_expiration`
        use VARCHAR(37) as primary key for ID's exposed to the user
        use INT(11) AUTO_INCREMENT as primary key for ID's not exposed to the user
        use the proper mysql engine Innodb or MyISAM
        mind the column charset and table collation
        all tables should have an id (PRIMARY KEY), date_created and date_updated
            *table id will follow the this format :
                `<singular form of table_name>_id` PRIMARY KEY VARCHAR(32) or INT(11) AUTO_INCREMENT
        see sample below:
*/


DROP DATABASE IF EXISTS test;
CREATE DATABASE test;

USE test;

CREATE TABLE IF NOT EXISTS users (
    id       INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email    VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    fullname VARCHAR(100) NOT NULL,
    /*...*/
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    date_updated DATETIME DEFAULT NULL,
    deleted DATETIME DEFAULT NULL
) ENGINE=InnoDB;
