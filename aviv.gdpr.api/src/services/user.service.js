const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dataservice = require ('./dataservice');
const{User, validate} = require('./../models/user.model');

//const db = require('_helpers/db');

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function authenticate({ username, password }) {
    const user = await User.scope('withHash').findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.hash)))
        throw 'Username or password is incorrect';

    // authentication successful
    const token = user.generateAuthToken();
    return { ...omitHash(user.get()), token };
}

async function getAll() {
    return await User.findAll();
}

async function getById(id) {
    return await getUser(id);
}

async function create(res,params) {
 
    const {error} = validate(params);

        if (error) {
            const errormessage = '{'+ '\"message'+'\":\"' +error.details[0].message.replace(/['"]+/g, '') +'\"}';
            return res.status(400).send(errormessage);
        }

        if (await User.findOne({ where: { username: params.username } })) {
            throw 'Username "' + params.username + '" is already taken';
        }

        var latest= await User.findOne({
         
            order: [ [ 'createdAt', 'DESC' ]],
        });

        let id=1;

        if(latest)
        id=latest.get('id')+1,

        latest=latest.get('id')+1;

        if (params.password) {            
            const salt = await bcrypt.genSalt(10);
            params.hash = await bcrypt.hash(params.password, salt);            
        }
   
    let user = new User({
        id:id,
        firstName: params.firstName,
        lastName: params.lastName,
        username:params.username,
        hash:params.hash,
        isAdmin:params.isAdmin
    })

    await user.save(); 
    
}

async function update(id, params) {
    const user = await getUser(id);

    // validate
    const usernameChanged = params.username && user.username !== params.username;
    if (usernameChanged && await User.findOne({ where: { username: params.username } })) {
        throw 'Username "' + params.username + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }

    // copy params to user and save
    Object.assign(user, params);
    await user.save();

    return omitHash(user.get());
}

async function _delete(id) {
    const user = await getUser(id);
    await user.destroy();
}

// helper functions

async function getUser(id) {
    const user = await User.findByPk(id);
    if (!user) throw 'User not found';
    return user;
}

function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}