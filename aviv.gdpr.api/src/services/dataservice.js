
const mssql = require('mssql'); 
const config = require('config');
var sqlConfig = config.get('sql');


  // connect to your database
 var con= mssql.connect(sqlConfig, function (err) {  
      if (err) console.log(err);
      
  });


function query(sql){
  return new Promise(function(resolve,reject){
    
    con.query(sql,  function(err,result)  {
  
      if(err){ 
        console.log("query error " + err)
        throw err}

        
      resolve(result);
  
    })
  })
  }


module.exports.query = query;






