/**
 * Created by Marcelo on 2016-12-03.
 */
let config = require('../src/server-config/index');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
let expect = chai.expect;

chai.use(chaiHttp);

/**
 * Variables
 */
let port = process.env.PORT || 3000
let API_ENDPOINT = process.env.API_ENDPOINT || 'http://localhost:' + port
let adminUserId = null;
let adminToken = null;
let userId = null;
let userToken = null;

describe('Example API tests:', () => {
    /**
     * Some setup to get a token to work
     */
    before((done) => {
        let admin = {
            username: 'admin',
            password: 'password',
            admin: true
        }
        chai.request(API_ENDPOINT)
            .post('/register')
            .send(admin)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.success).to.equal(true);
                expect(res.body.message).to.equal(config.USER_ADDED);
                expect(res.body.user.password).to.not.equal('password');
                adminUserId = res.body.user._id;
                chai.request(API_ENDPOINT)
                    .post('/api/authenticate')
                    .send(admin)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        adminToken = res.body.token;
                        done();
                    });
            });
    });

    it('POST /register: Should fail registration, no password', (done) => {
        let user = {
            username: 'mbarth'
        }
        chai.request(API_ENDPOINT)
            .post('/register')
            .send(user)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body.success).to.equal(false);
                expect(res.body.message).to.equal(config.VALIDATION_ERROR_PREFIX + config.PASSWORD_REQUIRED);
                expect(res.body.err.message).to.equal(config.MONGOOSE_USER_VALIDATION_FAILED_MESSAGE);
                expect(res.badRequest).to.equal(true);
                done();
            });
    });

    it('POST /register: Should fail registration, empty password', (done) => {
        let failingPassword = ' '
        let expectedErrorMessage = config.NOT_A_VALID_PASSWORD.replace(/\{VALUE\}/gi, failingPassword);
        let user = {
            username: 'mbarth',
            password: failingPassword
        }
        chai.request(API_ENDPOINT)
            .post('/register')
            .send(user)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body.success).to.equal(false);
                expect(res.body.message).to.equal(config.VALIDATION_ERROR_PREFIX + expectedErrorMessage);
                expect(res.body.err.message).to.equal(config.MONGOOSE_USER_VALIDATION_FAILED_MESSAGE);
                expect(res.badRequest).to.equal(true);
                done();
            });
    });

    it('POST /register: Should fail registration, no username', (done) => {
        let user = {
            password: 'password'
        }
        chai.request(API_ENDPOINT)
            .post('/register')
            .send(user)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body.success).to.equal(false);
                expect(res.body.message).to.equal(config.VALIDATION_ERROR_PREFIX + config.USERNAME_REQUIRED);
                expect(res.body.err.message).to.equal(config.MONGOOSE_USER_VALIDATION_FAILED_MESSAGE);
                expect(res.badRequest).to.equal(true);
                done();
            });
    });

    it('POST /register: Should fail registration, empty username', (done) => {
        let user = {
            admin: ' ',
            password: 'password'
        }
        chai.request(API_ENDPOINT)
            .post('/register')
            .send(user)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body.success).to.equal(false);
                expect(res.body.message).to.equal(config.VALIDATION_ERROR_PREFIX + config.USERNAME_REQUIRED);
                expect(res.body.err.message).to.equal(config.MONGOOSE_USER_VALIDATION_FAILED_MESSAGE);
                expect(res.badRequest).to.equal(true);
                done();
            });
    });

    /**
     * There's an open issue with mongoose that converts any string will cast anything into a boolean
     * so can't test for this just yet
     * see: https://github.com/Automattic/mongoose/issues/4245
     */
    /*it('Should fail registration, wrong admin type', (done) => {
        let newuser = {
            username: 'mbarth',
            password: 'password',
            admin: 'stringType'
        }
        chai.request(API_ENDPOINT)
            .post('/register')
            .send(newuser)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body.success).to.equal(false);
                expect(res.body.message).to.equal('ValidationError: stringType should be a boolean type');
                expect(res.body.err.message).to.equal(server-config.MONGOOSE_USER_VALIDATION_FAILED_MESSAGE);
                expect(res.badRequest).to.equal(true);
                done();
            });
    });*/

    it('POST /register: User creation should pass and password should be hashed', (done) => {
        let cleartextPassword = 'firstPassword'
        let user = {
            username: 'mbarth',
            password: cleartextPassword
        }
        chai.request(API_ENDPOINT)
            .post('/register')
            .send(user)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.success).to.equal(true);
                expect(res.body.message).to.equal(config.USER_ADDED);
                expect(res.body.user.password).to.not.equal(cleartextPassword);
                res.body.user.should.have.property('username').eql('mbarth');
                res.body.user.should.have.property('password');
                res.body.user.should.have.property('admin').eql(false);
                res.body.user.should.have.property('createdAt');
                res.body.user.should.have.property('_id');
                userId = res.body.user._id;
                done();
            });
    });

    it('POST /api/authenticate: Authenticate with non-admin user to retrieve token', (done) => {
        let cleartextPassword = 'firstPassword'
        let user = {
            username: 'mbarth',
            password: cleartextPassword
        }
        chai.request(API_ENDPOINT)
            .post('/api/authenticate')
            .send(user)
            .end((err, res) => {
                expect(res).to.have.status(200);
                userToken = res.body.token;
                done();
            });
    });

    it('GET /api/user/:id: User retrieval should pass', (done) => {
        chai.request(API_ENDPOINT)
            .get('/api/user/' + userId)
            .send({token: userToken})
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                res.body.user.should.have.property('username').eql('mbarth');
                res.body.user.should.have.property('password');
                res.body.user.should.have.property('admin').eql(false);
                res.body.user.should.have.property('createdAt');
                res.body.user.should.have.property('_id').eql(userId);
                done();
            });
    });

    it('GET /api/user/:id: User retrieval should fail because of unknown ID', (done) => {
        chai.request(API_ENDPOINT)
            .get('/api/user/' + '59994c07b1cf91a24985636b')
            .send({token: userToken})
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.notFound).to.equal(true);
                done();
            });
    });

    it('PUT /api/user/:id: User update should pass, made user admin', (done) => {
        chai.request(API_ENDPOINT)
            .put('/api/user/' + userId)
            .send({token: userToken, admin: true, password: 'password'})
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.message).to.equal(config.USER_UPDATED);
                expect(res.body.user.admin).to.equal(true);
                done();
            });
    });

    it('PUT /api/user/:id: User update should pass, set admin back to false', (done) => {
        chai.request(API_ENDPOINT)
            .put('/api/user/' + userId)
            .send({token: userToken, admin: false, password: 'password'})
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.message).to.equal(config.USER_UPDATED);
                expect(res.body.user.admin).to.equal(false);
                done();
            });
    });

    it('POST /api/authenticate: New password should authenticate and receive a valid token', (done) => {
        let user = {
            username: 'mbarth',
            password: 'password'
        }
        chai.request(API_ENDPOINT)
            .post('/api/authenticate')
            .send(user)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.token).to.exist;
                userToken = res.body.token;
                expect(res.body.success).to.equal(true);
                expect(res.body.message).to.equal(config.JWT_TOKEN);
                done();
            });
    });

    it('PUT /api/user/:id: User update should fail because of unknown ID', (done) => {
        chai.request(API_ENDPOINT)
            .put('/api/user/' + '5944c07b1cf91a24985636b0')
            .send({token: userToken, admin: true, password: 'password'})
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.error).not.be.empty;
                expect(err).not.be.empty;
                done();
            });
    });

    it('PUT /api/user/:id: User update should fail, empty values sent', (done) => {
        let missingParams = 'password parameter, admin parameter';
        let errorMessage = config.USER_UPDATE_FAILED.replace(/\{VALUE\}/gi, missingParams)
        chai.request(API_ENDPOINT)
            .put('/api/user/' + userId)
            .send({token: userToken})
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body.message).to.equal(errorMessage);
                done();
            });
    });

    it('PUT /api/user/:id: User update should fail, missing admin parameter', (done) => {
        let missingParams = 'admin parameter';
        let errorMessage = config.USER_UPDATE_FAILED.replace(/\{VALUE\}/gi, missingParams)
        chai.request(API_ENDPOINT)
            .put('/api/user/' + userId)
            .send({token: userToken, password: 'password'})
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body.message).to.equal(errorMessage);
                done();
            });
    });

    it('PUT /api/user/:id: User update should fail, missing password parameter', (done) => {
        let missingParams = 'password parameter';
        let errorMessage = config.USER_UPDATE_FAILED.replace(/\{VALUE\}/gi, missingParams)
        chai.request(API_ENDPOINT)
            .put('/api/user/' + userId)
            .send({token: userToken, admin: true})
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body.message).to.equal(errorMessage);
                done();
            });
    });

    it('PUT /api/user/:id: User update should fail because of invalid empty password value', (done) => {
        let failingPassword = ' '
        let expectedErrorMessage = config.NOT_A_VALID_PASSWORD.replace(/\{VALUE\}/gi, failingPassword);
        chai.request(API_ENDPOINT)
            .put('/api/user/' + userId)
            .send({token: userToken, admin: true, password: failingPassword})
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.error).not.be.empty;
                expect(res).to.be.json;
                expect(res.body.success).to.equal(false);
                expect(res.body.message).to.equal(config.VALIDATION_ERROR_PREFIX + expectedErrorMessage);
                expect(res.body.err.message).to.equal(config.MONGOOSE_USER_VALIDATION_FAILED_MESSAGE);
                expect(res.badRequest).to.equal(true);
                done();
            });
    });

    it('POST /api/authenticate: New password should fail authentication', (done) => {
        let user = {
            username: 'mbarth',
            password: ' '
        }
        chai.request(API_ENDPOINT)
            .post('/api/authenticate')
            .send(user)
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res).to.be.json;
                expect(res.body.success).to.equal(false);
                expect(res.body.message).to.equal(config.AUTH_FAILED_WRONG_PASSWORD);
                expect(res.unauthorized).to.equal(true);
                done();
            });
    });

    /**
     * There's an open issue with mongoose that converts any string will cast anything into a boolean
     * so can't test for this just yet
     * see: https://github.com/Automattic/mongoose/issues/4245
     */
    /*it('PUT /api/user/:id: User update should fail because of invalid admin value', (done) => {
        chai.request(API_ENDPOINT)
            .put('/api/user/' + userId)
            .send({token: token, admin: 'invalid value'})
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.error).not.be.empty;
                done();
            });
    });*/

    it('POST /api/authenticate: Old password should still be valid, authentication returns a valid token', (done) => {
        let user = {
            username: 'mbarth',
            password: 'password'
        }
        chai.request(API_ENDPOINT)
            .post('/api/authenticate')
            .send(user)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.token).to.exist;
                userToken = res.body.token;
                expect(res.body.success).to.equal(true);
                expect(res.body.message).to.equal(config.JWT_TOKEN);
                done();
            });
    });

    it('POST /register: Failed registration, username already in use', (done) => {
        let user = {
            username: 'admin',
            password: 'password'
        }
        chai.request(API_ENDPOINT)
            .post('/register')
            .send(user)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body.success).to.equal(false);
                expect(res.body.message).to.equal(config.ERROR_PREFIX + config.USERNAME_ALREADY_IN_USE);
                expect(res.badRequest).to.equal(true);
                done();
            });
    });

    it('POST /register: Failed registration, missing username', (done) => {
        let user = {
            password: 'password'
        }
        chai.request(API_ENDPOINT)
            .post('/register')
            .send(user)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal(config.VALIDATION_ERROR_PREFIX + config.USERNAME_REQUIRED);
                expect(res.badRequest).to.equal(true);
                done();
            });
    });

    it('POST /register: Failed registration, missing password', (done) => {
        let user = {
            username: 'admin'
        }
        chai.request(API_ENDPOINT)
            .post('/register')
            .send(user)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal(config.VALIDATION_ERROR_PREFIX + config.PASSWORD_REQUIRED);
                expect(res.badRequest).to.equal(true);
                done();
            });
    });

    it('POST /api/authenticate: Fail an authentication, wrong password', (done) => {
        let user = {
            username: 'admin',
            password: 'wrongPassword'
        }
        chai.request(API_ENDPOINT)
            .post('/api/authenticate')
            .send(user)
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res).to.be.json;
                expect(res.body.success).to.equal(false);
                expect(res.body.message).to.equal(config.AUTH_FAILED_WRONG_PASSWORD);
                expect(res.unauthorized).to.equal(true);
                done();
            });
    });

    it('POST /api/authenticate: Fail an authentication, unknown user', (done) => {
        let user = {
            username: 'unknownUser',
            password: 'password'
        }
        chai.request(API_ENDPOINT)
            .post('/api/authenticate')
            .send(user)
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res).to.be.json;
                expect(res.body.success).to.equal(false);
                expect(res.body.message).to.equal(config.AUTH_FAILED_USER_NOT_FOUND);
                expect(res.unauthorized).to.equal(true);
                done();
            });
    });

    it('GET /: Should not require token', (done) => {
        chai.request(API_ENDPOINT)
            .get('/')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });
    });

    it('GET /api/: Should get access when using a valid token', (done) => {
        chai.request(API_ENDPOINT)
            .get('/api/')
            .send({token: adminToken})
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });
    });

    it('GET /api/user: Missing token should get a 401', (done) => {
        chai.request(API_ENDPOINT)
            .get('/api/user')
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res).to.be.json;
                expect(res.body.success).to.equal(false);
                expect(res.body.message).to.equal(config.AUTH_NO_TOKEN_PROVIDED);
                done();
            });
    });

    it('GET /api/user: Should fail with an invalid token, http code of 401', (done) => {
        chai.request(API_ENDPOINT)
            .get('/api/user')
            .send({token: 'invalidtoken'})
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res).to.be.json;
                expect(res.body.success).to.equal(false);
                expect(res.body.message).to.equal(config.AUTH_FAILED_INVALID_TOKEN);
                expect(res.unauthorized).to.equal(true);
                done();
            });
    });

    it('GET /api/user: Should get a list of users equal to two', (done) => {
        chai.request(API_ENDPOINT)
            .get('/api/user')
            .send({token: adminToken})
            .end((err, res) => {
                res.body.users.should.be.a('array');
                expect(res.body.users).to.have.lengthOf(2);
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(err).to.be.null;
                done();
            });
    });

    it('GET /api/protected: Regular user is authorized to view user protected data', (done) => {
        chai.request(API_ENDPOINT)
            .get('/api/protected')
            .send({token: userToken})
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.success).to.equal(true);
                expect(res.body.message).to.equal(config.USER_PROTECTED_DATA);
                done();
            });
    });

    it('GET /api/admin/protected: Regular user is unauthorized to view admin protected data, should get 403 Forbidden', (done) => {
        chai.request(API_ENDPOINT)
            .get('/api/admin/protected')
            .send({token: userToken})
            .end((err, res) => {
                expect(res).to.have.status(403);
                expect(res).to.be.json;
                expect(res.body.success).to.equal(false);
                expect(res.body.message).to.equal(config.AUTH_NOT_AUTHORIZED);
                expect(res.forbidden).to.equal(true);
                done();
            });
    });

    it('GET /api/protected: Admin user is authorized to view regular user protected data', (done) => {
        chai.request(API_ENDPOINT)
            .get('/api/protected')
            .send({token: adminToken})
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.success).to.equal(true);
                expect(res.body.message).to.equal(config.USER_PROTECTED_DATA);
                done();
            });
    });

    it('GET /api/admin/protected: Admin user is authorized to view admin dashboard', (done) => {
        chai.request(API_ENDPOINT)
            .get('/api/admin/protected')
            .send({token: adminToken})
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.success).to.equal(true);
                expect(res.body.message).to.equal(config.ADMIN_PROTECTED_DATA);
                done();
            });
    });

    it('DELETE /api/user/:id: User delete should pass', (done) => {
        chai.request(API_ENDPOINT)
            .delete('/api/user/' + userId)
            .send({token: adminToken})
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.success).to.equal(true);
                expect(res.body.message).to.equal(config.USER_DELETED);
                done();
            });
    });

    it('GET /api/user: Should get a list of users equal to one', (done) => {
        chai.request(API_ENDPOINT)
            .get('/api/user')
            .send({token: adminToken})
            .end((err, res) => {
                res.body.users.should.be.a('array');
                expect(res.body.users).to.have.lengthOf(1);
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(err).to.be.null;
                done();
            });
    });

    it('DELETE /api/user/:id: Admin user delete should fail due to wrong id', (done) => {
        chai.request(API_ENDPOINT)
            .delete('/api/user/' + '5844c07b1cf91a24985636b2')
            .send({token: adminToken})
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body.success).to.equal(false);
                expect(res.body.message).to.equal(config.USER_NOT_FOUND);
                done();
            });
    });

    it('DELETE /api/user/:id: Admin user delete should pass', (done) => {
        chai.request(API_ENDPOINT)
            .delete('/api/user/' + adminUserId)
            .send({token: adminToken})
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.success).to.equal(true);
                expect(res.body.message).to.equal(config.USER_DELETED);
                done();
            });
    });

    it('GET /api/user: List of users should now be zero', (done) => {
        chai.request(API_ENDPOINT)
            .get('/api/user')
            .send({token: adminToken})
            .end((err, res) => {
                res.body.users.should.be.a('array');
                expect(res.body.users).to.have.lengthOf(0);
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(err).to.be.null;
                done();
            });
    });
});