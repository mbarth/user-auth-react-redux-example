/**
 * Created by Marcelo on 2016-12-02.
 */

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const express = require('express');
const app = new (express)();

const config = require('./webpack.config');
const compiler = webpack(config);

// let app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const serverConfig = require('./src/server-config');
const User = require('./src/models/user');
const UserRoutes = require('./src/server-routes/user');
const ProtectedRoutes = require('./src/server-routes/protected');

app.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
}));
app.use(webpackHotMiddleware(compiler));


//db connection
mongoose.connect(serverConfig.DB_URL, serverConfig.DB_OPTIONS); // connect to our database
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

let host = serverConfig.HOST;
let port = serverConfig.PORT;
app.set(serverConfig.JWT_SUPER_SECRET_KEY, serverConfig.SECRET); // SECRET variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

/**
 * Non-authenticated server-routes
 */
// basic route (http://localhost:3000)
app.get('/', function (req, res) {
    res.send('Welcome to an Example Auth API located at http://localhost:' + port + '/api');
});

// allow for registration
app.post('/register', function (req, res) {
    UserRoutes.postUser(req, res)
});

let apiRoutes = express.Router();

/**
 * Method that verifies user's password, returning a token
 */
apiRoutes.post('/authenticate', function (req, res) {
    // find the user
    User.findOne({
        username: req.body.username
    }, function (err, user) {
        if (err) throw err;

        if (!user) {
            res.status(401).json({success: false, message: serverConfig.AUTH_FAILED_USER_NOT_FOUND});
        } else if (user) {
            // check if password matches
            try {
                if (!user.isValidPassword(req.body.password)) {
                    res.status(401).json({success: false, message: serverConfig.AUTH_FAILED_WRONG_PASSWORD});
                } else {
                    // user is found and password is correct, so create a token
                    let token = jwt.sign({
                        id: user._id,
                        username: user.username,
                        admin: user.admin
                    }, app.get(serverConfig.JWT_SUPER_SECRET_KEY), {
                        expiresIn: 86400 // expires in 24 hours
                    });

                    res.json({
                        success: true,
                        message: serverConfig.JWT_TOKEN,
                        token: token
                    });
                }
            } catch (err) {
                /**
                 * Arrive here if isValidPassword method experiences an error
                 * comparing token. No option here but to fail authentication.
                 */
                res.status(401).json({success: false, message: err.toString(), err});
            }
        }
    });
});

// route middleware to authenticate and check token
apiRoutes.use(function (req, res, next) {
    // retrieve token out of header, url, or post parameters
    let token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies SECRET and checks expiry
        // NOTE: using concatenation to trigger the toString() method on the token object
        jwt.verify(token + '', app.get(serverConfig.JWT_SUPER_SECRET_KEY), function (err, decoded) {
            if (err) {
                return res.status(401).send({
                    success: false,
                    message: serverConfig.AUTH_FAILED_INVALID_TOKEN
                });
            } else {
                // if everything is good, save to request for use in other server-routes
                // so they can check whethere user is an admin, etc.
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // return an error if there is no token
        return res.status(401).send({
            success: false,
            message: serverConfig.AUTH_NO_TOKEN_PROVIDED
        });
    }
});

/**
 * Authenticated server-routes
 */
apiRoutes.get('/', function (req, res) {
    res.json({message: 'Example Auth API'});
});

apiRoutes.route('/user')
    .get(UserRoutes.getUsers)
    .post(UserRoutes.postUser);
apiRoutes.route('/user/:id')
    .get(UserRoutes.getUser)
    .delete(UserRoutes.deleteUser)
    .put(UserRoutes.updateUser);
apiRoutes.route('/protected')
    .get(ProtectedRoutes.getUserProtected);
apiRoutes.route('/admin/protected/')
    .get(ProtectedRoutes.getAdminProtected);

app.use('/api', apiRoutes);

app.listen(port, host, (error) => {
    if (error) {
        console.error(error);
    } else {
        console.info('Server available at http://' + host + ':' + port);
    }
});