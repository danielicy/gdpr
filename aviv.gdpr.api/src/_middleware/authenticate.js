const { secret } = require('config');
const jwt = require('jsonwebtoken');


module.exports= function (req,res,next){
    const token = req.header('x-auth-token'); 
    if (!token) res.status(401).send('Access denied');

    try{
       const decoded=   jwt.verify(token,secret);
       req.user =decoded;
       next();
    }
    catch (ex)
    {
        res.status(400).send('Invalid token');
    }
}
