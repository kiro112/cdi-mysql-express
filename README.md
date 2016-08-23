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
  $ mysql -uroot < database/schema.sql
  $ mysql -uroot < database/seed.sql
  ```

3. Make sure redis server is running in correct PORT and HOST
 ```sh
  $ redis-server
  ```

4. Run this commands to get started:
  ```sh
  $ sudo npm i -g forever
  $ sudo npm i -g nodemon
  $ sudo npm install
  ```

5. To run the server using nodemon: 
  ```sh
  $ nodemon server.js
  ```

6. Using cluster:
  ```sh
  $ nodemon cluster.js
  $ forever start cluster.js
  ```

7. After starting the server, run this commands to check:
  ```sh
  $ curl http://localhost:8000
  ```

<!-- ## Special Thanks
(https://www.bithound.io/github/anyTV/anytv-node-boilerplate), especially rvnjl <3 -->
