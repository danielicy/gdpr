const {User} = require('./../../../models/user.model');
const jwt = require('jsonwebtoken');
const config = require('config');

describe('user.generateAuthToken',() =>{
    it('should return a valid JWT',() =>{
        const user = new User({id:1,isAdmin: true});
        const token = user.generateAuthToken();
        const decoded = jwt.verify(token,config.secret);
        
        expect(decoded).toMatchObject({id: 1,isAdmin: true});
    });
});