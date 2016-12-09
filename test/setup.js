/**
 * Created by Marcelo on 2016-12-05.
 */
let config = require('../src/server-config');
let chai = require('chai');
let chaiHttp = require('chai-http');
let expect = chai.expect;
let should = chai.should();

chai.use(chaiHttp);

/**
 * Variables
 */
let port = 3000
let API_ENDPOINT = process.env.API_ENDPOINT || 'http://localhost:' + port
let adminUserId = null;
let adminToken = null;

describe('Used for set up:', () => {
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

    it('GET /api/user/:id: User retrieval should pass', (done) => {
        chai.request(API_ENDPOINT)
            .get('/api/user/' + adminUserId)
            .send({token: adminToken})
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                res.body.user.should.have.property('username').eql('admin');
                res.body.user.should.have.property('password');
                res.body.user.should.have.property('admin').eql(true);
                res.body.user.should.have.property('createdAt');
                res.body.user.should.have.property('_id').eql(adminUserId);
                done();
            });
    });

    it('POST /register: User creation should pass and password should be hashed', (done) => {
        let user = {
            username: 'mbarth',
            password: 'password'
        }
        chai.request(API_ENDPOINT)
            .post('/register')
            .send(user)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.success).to.equal(true);
                expect(res.body.message).to.equal(config.USER_ADDED);
                expect(res.body.user.password).to.not.equal('password');
                res.body.user.should.have.property('username').eql('mbarth');
                res.body.user.should.have.property('password');
                res.body.user.should.have.property('admin').eql(false);
                res.body.user.should.have.property('createdAt');
                res.body.user.should.have.property('_id');
                userId = res.body.user._id;
                done();
            });
    });

});