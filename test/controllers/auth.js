'use strict';
process.env.NODE_ENV = 'local';

const should  = require('chai').should();
const request = require('supertest');
const server  = require(__dirname+ '/../../server').app;
const api     = request.agent(server);

describe('Authentication Login', () => {

    let token;

    it('should not login with incorrect email', (done) => {
        api.post('/auth/login')
           .send('email=wrong&password=wrong')
           .expect(400)
           .end( (err, res) => {
                should.not.exist(err);
                should.exist(res);
                res.body.should.have.property('success', false);
                res.body.should.have.property('errors');
                res.body.errors[0].should.have.property('context', 'Invalid username');
                done();
           });
    });

    it('should not login with incorrect password', (done) => {
        api.post('/auth/login')
           .send('email=correct@email.com&password=wrong')
           .expect(400)
           .end( (err, res) => {
                should.not.exist(err);
                should.exist(res);
                res.body.should.have.property('success', false);
                res.body.should.have.property('errors');
                res.body.errors[0].should.have.property('context', 'Incorrect Password');
                done();
            });
    });

    it('should login with correct credentials', (done) => {
        api.post('/auth/login')
           .send('email=correct@email.com&password=correct')
           .expect(200)
           .end( (err, res) => {
                should.not.exist(err);
                should.exist(res);
                res.body.should.have.property('success', true);
                res.body.should.have.property('data');
                res.body.data.should.have.property('items');
                res.body.data.items[0].should.have.property('token');
                token = res.body.data.items[0].token;

                // logout to delete token
                api.post('/auth/logout')
                   .expect(200)
                   .send('token=' + token)
                   .end( (err, res) => {
                        done();
                   });
           });
    });

    it('should login in any letter case of email', (done) => {
        api.post('/auth/login')
           .send('email=cOrRecT@eMaiL.com&password=correct')
           .expect(200)
           .end( (err, res) => {
                should.not.exist(err);
                should.exist(res);
                res.body.should.have.property('success', true);
                res.body.should.have.property('data');
                res.body.data.should.have.property('items');
                res.body.data.items[0].should.have.property('token');
                token = res.body.data.items[0].token;

                // logout to delete token
                api.post('/auth/logout')
                   .expect(200)
                   .send('token=' + token)
                   .end( (err, res) => {
                        done();
                   });
           });
    });


});

describe('Authentication Logout', () => {

    let token;

    before( (done) => {
        api.post('/auth/login')
           .send('email=correct@email.com&password=correct')
           .expect(200)
           .end( (err, res) => {
                token = res.body.data.items[0].token;
                done();
           });
    });

    it('should logout normally', (done) => {
        api.post('/auth/logout')
           .expect(200)
           .send('token=' + token)
           .end( (err, res) => {
                should.not.exist(err);
                should.exist(res);
                res.body.should.have.property('success', true);
                res.body.should.have.property('data');
                res.body.data.should.have.property('items');
                res.body.data.items[0].should.have.property('message', 'User successfully logged out');
                done();
           });

    });

});