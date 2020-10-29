
const pruner=require('./pruner');
const dataservice = require('../services/dataservice');
const emr = require('config').get('emr');

function forgetpatient(patient_id) {
    return new Promise(function(resolve,reject){



        pruner.prune(patient_id)
    .then( r => 
                resolve(r))          
    /*.catch(reject( err =>
        new Error('forgetpatient: ' +err)))*/
    });

}




function getPatients() {
    return new Promise(function(resolve,reject){
        dataservice.query("SELECT *  FROM ["+ emr +"].[dbo].[Patients]")
        .then(response =>
            resolve(response))
        });

}






 module.exports.forgetpatient = forgetpatient;
 module.exports.getPatients = getPatients;