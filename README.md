# `cdi-mysql-express`

Requirements
-----
1. MySQL 5.6
2. Redis
3. Node.js version 5.0 or above

## Running the application
1. Download zip
2. Import `database/seed.sql` and `database/migrate.sql`
  ```sh
  mysql -uroot < database/seed.sql
  mysql -uroot < database/migrate.sql
  mysql -uroot < database/routines.sql
  ```

3. Run this commands :
  ```sh
  sudo npm i -g forever
  sudo npm i -g nodemon
  sudo npm start
  ```