var router = require('express').Router();
const auth = require('../../_middleware/authenticate');


router.use('/gdpr', require('./gdpr.controller'));
router.use('/users', require('./users.controller'));
router.use('/auth', require('./auth.controller'));

router.use(function(err, req, res, next){
  if(err.name === 'ValidationError'){
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function(errors, key){
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }

  return next(err);
});

module.exports = router;