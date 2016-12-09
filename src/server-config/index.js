/**
 * Created by Marcelo on 2016-12-02.
 */
module.exports = {
    HOST: process.env.HOST || 'localhost',
    PORT: process.env.PORT || 3001,
    SECRET: 'authAPIsecret',
    DB_URL: 'mongodb://' + (process.env.HOST || 'localhost') + '/auth-user-db',

    DB_OPTIONS: {
        server: {socketOptions: {keepAlive: 1, connectTimeoutMS: 30000}},
        replset: {socketOptions: {keepAlive: 1, connectTimeoutMS: 30000}}
    },

    JWT_SUPER_SECRET_KEY: 'jwtSuperSecret',
    JWT_TOKEN: 'JWT Token',
    AUTH_NO_TOKEN_PROVIDED: 'No token provided.',
    AUTH_NOT_AUTHORIZED: 'Not authorized.',
    AUTH_FAILED_INVALID_TOKEN: 'Authentication failed. Invalid token.',
    AUTH_FAILED_USER_NOT_FOUND: 'Authentication failed. User not found.',
    AUTH_FAILED_WRONG_PASSWORD: 'Authentication failed. Wrong password.',

    USERNAME: "username",
    PASSWORD: "password",

    USER_NOT_FOUND: "User not found.",
    USER_ADDED: 'User successfully added.',
    USER_DELETED: "User successfully deleted.",
    USER_UPDATED: 'User successfully updated.',
    USER_UPDATE_FAILED: 'User update failed. Missing {VALUE}.',
    USERNAME_REQUIRED: 'Username required.',
    USERNAME_ALREADY_IN_USE: 'Username already in use.',
    PASSWORD_REQUIRED: 'Password required.',
    NOT_A_VALID_PASSWORD: '{VALUE} is not a valid password.',

    ERROR_PREFIX: 'Error: ',
    VALIDATION_ERROR_PREFIX: 'ValidationError: ',
    MONGOOSE_USER_VALIDATION_FAILED_MESSAGE: 'user validation failed',

    USER_PROTECTED_DATA: 'User protected data',
    ADMIN_PROTECTED_DATA: 'Admin protected data',
};