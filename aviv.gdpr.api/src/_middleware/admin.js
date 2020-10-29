module.exports = function (req,res,next){
    //forbidden
    if(!req.user.isAdmin) return res.status(403).send('Access Denied!');

    next();
}