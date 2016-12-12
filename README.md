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
3. export NODE_ENV=development
4. node server.js
````
Then visit `localhost:3000` in your browser.

## License

Everything in this repo is MIT License unless otherwise specified.
