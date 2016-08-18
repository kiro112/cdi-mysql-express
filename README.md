# `cdi-mysql-express`

Requirements
-----
1. MySQL 5.6
2. Redis
3. Node.js version 5.0 or above

## Running the application
1. Download zip
2. Import `database/schema.sql` and `database/seed.sql`
  ```sh
  mysql -uroot < database/schema.sql
  mysql -uroot < database/seed.sql
  ```

3. Run this commands :
  ```sh
  sudo npm i -g forever
  sudo npm i -g nodemon
  sudo npm start
  ```

4. Using cluster:
  ```sh
  nodemon cluster.js
  forever start cluster.js
  ```

<!-- ## Special Thanks
(https://www.bithound.io/github/anyTV/anytv-node-boilerplate), especially rvnjl <3 -->
