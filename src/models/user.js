/**
 * Created by Marcelo on 2016-12-02.
 */
let mongoose = require('mongoose');
let bcrypt = require('bcrypt-nodejs');
let config = require('../server-config');
let Schema = mongoose.Schema;
let SALT_WORK_FACTOR = 10;

// user schema definition
let UserSchema = new Schema(
    {
        username: {
            type: String,
            validate: {
                validator: function (v) {
                    return !/^\s*$/.test(v);
                }
            },
            required: [true, config.USERNAME_REQUIRED],
            index: {unique: true}
        },
        password: {
            type: String,
            validate: {
                validator: function (v) {
                    return !/^\s*$/.test(v);
                },
                message: config.NOT_A_VALID_PASSWORD
            },
            required: [true, config.PASSWORD_REQUIRED]
        },
        admin: {
            type: Boolean,
            required: false,
            default: false,
            validate: {
                // NOTE: not working yet as an open issue with Mongoose
                validator: function (v) {
                    return typeof(v) === "boolean";
                },
                message: '{VALUE} should be a boolean type'
            }
        },
        createdAt: {type: Date, default: Date.now},
    },
    {
        versionKey: false
    }
);

// Sets the createdAt parameter equal to the current time and hashes the password
UserSchema.pre('save', function (next, done) {
    let self = this;
    if (self.isNew) {
        // we're only checking for unique username on new user instances
        mongoose.models['user'].findOne({username: self.username}, function (err, user) {
            if (err) {
                done(err);
            } else if (user) { //there was a result found, so the username exists
                self.invalidate(config.USERNAME, config.USERNAME_ALREADY_IN_USE);
                done(new Error(config.USERNAME_ALREADY_IN_USE));
            } else {
                let now = new Date();
                if (!self.createdAt) {
                    self.createdAt = now;
                }
                // generate a salt
                bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
                    if (err) return next(err);

                    // hash the password along with our new salt
                    bcrypt.hash(self.password, salt, null, function (err, hash) {
                        if (err) return next(err);

                        // override the cleartext password with the hashed one
                        self.password = hash;
                        next();
                    });
                });
            }
        });
    } else {
        if (!self.isModified(config.PASSWORD)) return next();
        // generate a salt
        bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
            if (err) return next(err);

            // hash the password along with our new salt
            bcrypt.hash(self.password, salt, null, function (err, hash) {
                if (err) return next(err);

                // override the cleartext password with the hashed one
                self.password = hash;
                next();
            });
        });
    }
});

// checking if password is valid
UserSchema.methods.isValidPassword = function (password) {
    let isValid = false;
    try {
        isValid = bcrypt.compareSync(password, this.password);
    } catch (err) {
        throw err;
    }
    return isValid;
};

//Exports the UserSchema for use elsewhere.
module.exports = mongoose.model('user', UserSchema);
