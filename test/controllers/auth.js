'use strict';
process.env.NODE_ENV = 'development';

const should  = require('chai').should();
const request = require('supertest');
const server  = require(__dirname+ '/../server').app;
const api     = request.agent(server);

describe('Authentication Login' () => {

    let userId,
        token;

    it('should not login with incorrect email', (done) => {
        api.post('/auth/login')
           .send('email=wrong&password=wrong')
           .expect(400)
           .end( (err, res) => {
                should.not.exist(err);
                should.exist(res);
                res.body.should.have.property('success', false);
                res.body.should.have.property('errors');
                res.body.errors.should.have.property('context', 'Invalid username');
                done();
           });
    });

    
});