const router = require('express').Router();
const formidable = require('formidable'); 
const authenticate = require('../../_middleware/authenticate');
const admin = require('./../../_middleware/admin');
const Joi = require('joi');
const { response } = require('express');
const gdprmanager = require('../../modules/gdprmanager');
const logger = require('./../../_helpers/logger');


router.delete('/case_id/:id',[authenticate,admin], async  (req,res,next) => {


  const schema = Joi.object({
    id: Joi.number().required()});

    var result=  schema.validate({ id: req.params.id });

    if(result.error){
    res.status(400).send(result.error);
    return;
    }
 
    
    gdprmanager.forgetpatient(req.params.id)
    .then(reply =>
        res.end(JSON.stringify(reply)))
      .catch(next);

});

router.get('/patients',function (req,res,next) {
    
  gdprmanager.getPatients()
.then(patients =>
  res.end(JSON.stringify(patients.recordset)))
  .catch(next);

})


  module.exports = router;