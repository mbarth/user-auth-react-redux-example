/**
 * Created by Marcelo on 2016-12-05.
 */
const config = require('../server-config');

/*
 * GET /protected route
 */
function getUserProtected(req, res) {
    return res.json({success: true, message: config.USER_PROTECTED_DATA});
}

/*
 * GET /admin/protected route
 */
function getAdminProtected(req, res) {
    let user = req.decoded;
    if (user.admin) {
        return res.json({success: true, message: config.ADMIN_PROTECTED_DATA});
    } else {
        return res.status(403).json({success: false, message: config.AUTH_NOT_AUTHORIZED});
    }
}

//export all the functions
module.exports = {getUserProtected, getAdminProtected};
