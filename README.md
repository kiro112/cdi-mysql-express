# `cdi-mysql-express`

Requirements
-----
1. MySQL 5.6 (or 5.7)
2. Redis
3. Node.js version 5.0 to 6.4.0

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
  
8. To get apidocs
  ```sh
  $ npm run docs
  ```
  Then check localhost:8000/apidoc/
  
 ## Directory-tree 
```
.
├── assets
├── config
    └── env
├── controllers
├── database
├── helpers
├── lib
├── logs
├── test
    └── controllers
├── uploads
└── views
```

# Folders
- assets -- where you place img, css, bower_components, fonts
- helpers -- js files for reusable methods
- uploads -- where users can upload files, and images
- views -- where templates are placed
- others are self explanatory I guess

# Create Controller
 Controllers are the heart of your application, as they determine how HTTP requests should be handled. They are located at the `controllers` folder. They are not automatically routed. You must explicitly route them in `config/router.js`. Using sub-folders for file organization is allowed.

Here's a typical controller:

```javascript
// user.js

const util   = require(__dirname + '/../helpers/util'),
const mysql  = require('anytv-node-mysql'),
const moment = require('moment');



exports.update_user = (req, res, next) => {
    const data = util.get_data(
        {
            user_id: '',
            _first_name: '',
            _last_name: ''
        },
        req.body
    );

    function start () {
        let id;

        if (data instanceof Error) {
            return res.warn(400, {message: data.message});
        }

        id = data.user_id;
        delete data.user_id;

        mysql.use('my_db')
            .query(
                'UPDATE users SET ? WHERE user_id = ? LIMIT 1;',
                [data, id],
                send_response
            )
            .end();
    }

    function send_response (err, result) {
        if (err) {
            return next(err);
        }

        res.send({message: 'User successfully updated'});
    }

    start();
};



exports.delete_user = (req, res, next) => {
...
```

Detailed explanation:

```javascript
const config = require(__dirname + '/../config/config');
const util   = require(__dirname + '/../helpers/util');
const mysql  = require('anytv-node-mysql');
const moment = require('moment');
```

- The first part of the controller contains the config, helpers, and libraries to be used by the controller's functions
- Notice the order of imported files, local files first followed by 3rd-party libraries
- This block should always be followed by at least one new line to separate them visually easily



```javascript
exports.update_user = (req, res, next) => {
```

- snake_case on exported function names
- `req` is an object from express, it contains user's request
- `res` also an object from express, use this object to respond to the request
- `next` a function from express, use this to pass to the next middleware which is the error handler


```javascript
    const data = util.get_data(
        {
            user_id: '',
            _first_name: '',
            _last_name: ''
        },
        req.body
    ),
```

- it is common to use `data` as the variable to store the parameters given by the user
- `util.get_data` helps on filtering the request payload
- putting an underscore as first character makes it optional
- non-function variables are also declared first
- new line after non-function variables to make it more readable

```javascript
    function start () {
        let id;

        if (data instanceof Error) {
            return res.warn(400, {message: data.message});
        }

        id = data.id;
        delete data.id;

        mysql.use('my_db')
            .query(
                'UPDATE users SET ? WHERE user_id = ? LIMIT 1;',
                [id, data],
                send_response
            )
            .end();
    }
```

- `start` function is required for uniformity
- the idea is to have the code be readable like a book, from top-to-bottom
- since variables are declared first and functions are assigned to variables, we thought of having `start` function to denote the start of the process
- as much as possible, there should be no more named functions inside this level except for `forEach`, `map`, `filter`, and `reduce`. If lodash is available, use it.

```javascript
    function send_response (err, result) {
        if (err) {
            return next(err);
        }

        res.send({message: 'User successfully updated'});
    }

    start();
```

- `send_response` is common to be the last function to be executed
- use `next` for passing server fault errors
- after all variable and function declarations, call `start`

Notes:
- use `res.warn(status, obj)` or `res.warn(obj)`  instead of `next(error)` if the error is caused by the API caller

License
-----
MIT


<!-- ## Special Thanks
(https://www.bithound.io/github/anyTV/anytv-node-boilerplate), especially rvnjl <3 -->
