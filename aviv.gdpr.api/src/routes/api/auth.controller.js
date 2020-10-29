const express = require('express');
const router = express.Router();
const Joi = require('joi');
const userService = require('./../../services/user.service');

const { User } = require('../../models/user.model');
const bcrypt = require('bcryptjs');


router.post('/authenticate', async (req,res) =>{
    const {error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    const errormessage = '{'+ '\"message'+'\":\"Invalid username or password\"}';

    let user = await User.findOne({ where: { username: req.body.username } })
    if(!user) return res.status(400).send(errormessage);

   const validPassword=await bcrypt.compare(req.body.password,user.hash);
   if(!validPassword) return res.status(400).send(errormessage);

   // authentication successful
  const token = user.generateAuthToken();
   //return { ...omitHash(user.get()), token };
    let ommited={...omitHash(user.get()), token}
   res.header('x-auth-token',ommited.token).send(ommited);
});

function validate(req){
    const schema = Joi.object({
        username: Joi.string().min(4).max(255).required(),
        password: Joi.string().min(5).max(255).required()
    });
    return schema.validate(req);
}

function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}

module.exports = router;


 

 