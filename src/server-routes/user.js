/**
 * Created by Marcelo on 2016-12-02.
 */
const User = require('../models/user');
const config = require('../server-config');
const jwt = require('jsonwebtoken');

/*
 * GET /user route to retrieve all the users.
 */
function getUsers(req, res) {
    //Query the DB and if no errors, send all the users
    let query = User.find({});
    query.exec((err, users) => {
        if (err) return res.send(err.message);
        //If no errors, send them back to the client
        return res.json({success: true, users});
    });
}

/*
 * POST /user to save a new user.
 */
function postUser(req, res) {
    //Creates a new user
    let newUser = new User(req.body);
    //Save it into the DB.
    newUser.save((err, user) => {
        if (err) {
            res.status(400).json({success: false, message: err.toString(), err});
        }
        else { //If no errors, send it back to the client
            res.json({success: true, message: config.USER_ADDED, user});
        }
    });
}

/*
 * GET /user/:id route to retrieve a user given its id.
 */
function getUser(req, res) {
    User.findById(req.params.id, (err, user) => {
        if (err || !user) {
            if (!user) {
                return res.status(404).json({success: false, message: config.USER_NOT_FOUND, user});
            }
            return res.status(400).json({success: false, message: err.toString(), err});
        }
        //If no errors, send it back to the client
        return res.json({success: true, user});
    });
}

/*
 * DELETE /user/:id to delete a user given its id.
 */
function deleteUser(req, res) {
    User.remove({_id: req.params.id}, (err, result) => {
        if (err) {
            return res.status(400).json({success: false, message: err.toString(), err});
        } else if (result.result.n > 0) {
            return res.json({success: true, message: config.USER_DELETED, result});
        } else {
            return res.status(404).json({success: false, message: config.USER_NOT_FOUND, result});
        }
    });
}

/*
 * PUT /user/:id to update a user given its id
 */
function updateUser(req, res) {
    let query = {_id: req.params.id};
    /**
     * NOTE: only allowing update of password and admin values, ignoring change to username
     */
    if (typeof(req.body.admin) !== 'undefined' && typeof(req.body.password) !== 'undefined') {
        User.findOne(query, (err, user) => {
            if (!user) return res.status(404).send(err);
            if (err) return res.status(400).send(err);
            user.password = req.body.password;
            user.admin = req.body.admin;
            //If found, attempt to save changes
            user.save(function (err) {
                if (err) {
                    return res.status(400).json({success: false, message: err.toString(), err});
                }
                // also return new token with updated user info, i.e. possible new admin role
                let token = jwt.sign({id: user._id, username: user.username, admin: user.admin}, config.SECRET, {
                    expiresIn: 86400 // expires in 24 hours
                });
                return res.json({success: true, message: config.USER_UPDATED, user, token});
            });
        });
    } else {
        // fail if some value was missing
        let missingAdminParameter = typeof(req.body.admin) === 'undefined' ? 'admin parameter' : '';
        let missingPasswordParameter = typeof(req.body.password) === 'undefined' ? 'password parameter' : '';
        let failingParams = missingPasswordParameter;
        if ('' === failingParams) {
            failingParams = missingAdminParameter
        } else if ('' !== missingAdminParameter) {
            failingParams += ', ' + missingAdminParameter;
        }
        let errorMessage = config.USER_UPDATE_FAILED.replace(/\{VALUE\}/gi, failingParams);
        return res.status(400).json({success: false, message: errorMessage});
    }
}

//export all the functions
module.exports = {getUsers, postUser, getUser, deleteUser, updateUser};