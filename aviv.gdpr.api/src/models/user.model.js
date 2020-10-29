const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');
const { Sequelize,DataTypes } = require('sequelize');
var sqlConfig = require('config').get('sql');
const sequelize = new Sequelize(sqlConfig.database, sqlConfig.user, sqlConfig.password, {host:sqlConfig.server, dialect: 'mssql' });
const User = sequelize.define('gdprUser', {
    // id:{type:DataTypes.INTEGER,allowNull: false,primaryKey:true},
     firstName: { type: DataTypes.STRING, allowNull: false },
     lastName: { type: DataTypes.STRING, allowNull: false },
     username: { type: DataTypes.STRING, allowNull: false },
     hash: { type: DataTypes.STRING, allowNull: false },
     isAdmin: { type: DataTypes.BOOLEAN, allowNull: false },
 }, 
 {
    defaultScope: {
        // exclude hash by default
        //attributes: { exclude: ['hash'] }
    },
    scopes: {
        // include hash with this scope
        withHash: { attributes: {}, }
    }
});


User.prototype.generateAuthToken=function ( ) {

   const token =jwt.sign({ id: this.id ,isAdmin:this.isAdmin}, config.secret, { expiresIn: '7d' });
return token
}

function validateUser(user) {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        username: Joi.string().required(),
        password: Joi.string().min(6).required(),
        isAdmin:Joi.bool()
    });
    return  schema.validate(user);
    
}

exports.User = User;
exports.validate = validateUser;
