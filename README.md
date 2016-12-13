### Goal
 
This project is an example of a user signup / login authentication flow using [react](https://github.com/facebook/react), 
[redux](https://github.com/rackt/redux), [react-router](https://github.com/rackt/react-router), [node](https://nodejs.org/), and [JSON web tokens (JWT)](http://jwt.io/).
 
The is project was adapted from [another github project](https://github.com/joshgeller/react-redux-jwt-auth-example) that served 
as a starting point to build off from. Specifically, this project makes use of a more robust server-side REST api for user CRUD 
management.
  
---

## Prerequisites
Make sure you have installed all of the following prerequisites on your development machine:
* Git - [Download & Install Git](https://git-scm.com/downloads).
* Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the [npm package manager](https://www.npmjs.com/).
* MongoDB - [Download & Install MongoDB](http://www.mongodb.org/downloads), and make sure it's running on the default port (27017).

## Running the app
To get the app running, follow the instructions below:

````
1. git clone https://github.com/mbarth/user-auth-react-redux-example.git
2. npm install
3. edit the .env file (set the port you want to run on, default set to 3000)
4. node server.js
````
Then visit `localhost:3000` in your browser (using the port you selected in the .env file).

## Testing
There are 2 test suites. One to test the react front-end and another to test the node REST API.

#### To test the React front-end, run:
```
npm run mocha
```

#### To test the REST API:
One terminal run the app:
```
node server.js
```
In another terminal, run the test suite:
```
mocha test-standalone
```

## Securing form submissions with SSL

This is an example auth app that serves only to highlight how an API would be 
written and consumed using a node server and a react front-end. In this 
example, the login and register forms are submitting clear text data. In 
a production environment we would update this to work over SSL. The changes 
involved would be to redirect the two ```/login``` and ```/register``` react 
routes through to HTTPS. On the node server side, we would use an ```HTTPS``` 
server.
 
Here's some sample code:
```
const https = require('https');

const options = {
  key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
  cert: fs.readFileSync('test/fixtures/keys/agent2-cert.cert')
};

// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app).listen(443);
```

## License

Everything in this repo is MIT License unless otherwise specified.
