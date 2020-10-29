const dataservice = require('../services/dataservice');
const cms = require('config').get('sql.database');
const emr = require('config').get('emr');
var rimraf = require("rimraf");
const uploadspath= require('config').get('uploadspath')
 

function deletequery(caseid){
  return  "DELETE r	"+
	"FROM ["+ cms +"].[dbo].[UFRecords] r "+	
	"INNER JOIN ["+ emr +"].[dbo].Documents d on d.FormEntryId = r.UniqueId	 "+	
	"INNER JOIN ["+ cms +"].[dbo].umbracoNode n on n.id = d.DocumantTypeId "+	
  "WHERE d.Case_Id	= " + caseid;
}

function deleteMessagesqry(caseid){
  return "DELETE "+
  "FROM ["+ emr +"].[dbo].[Messages] "+
  "WHERE Case_Id ="+ caseid
}

function deleteChatsqry(caseid){
  return "DELETE "+
  "FROM ["+ emr +"].[dbo].[Chats] "+
  "WHERE Case_Id ="+ caseid
}

function shredPatientQry(caseid){
  return "  UPDATE ["+ emr + "].[dbo].[Patients] "+
  "SET  [FirstName]='XXXXXXXX'  "+
  ",[MiddleName]='XXXXXXXX' "+
  ",[LastName]='XXXXXXXX'  "+
  ",[NationalID]='XXXXXXXX' "+
  ",[BirthDate]= CURRENT_TIMESTAMP "+
  ",[SpouseFullName]='XXXXXXXX' "+
  ",[Address]='XXXXXXXX' "+
  ",[Phone]='XXXXXXXX' "+
  ",[Mobile]='XXXXXXXX' "+
  ",[Image]='XXXXXXXX' "+
  ",[Email]='XXXXXXXX'  "+
  "FROM ["+ emr + "].[dbo].[Patients] pt "+
  "INNER JOIN ["+ emr + "].[dbo].[Cases] c "+
  "ON pt.Id = c.[Patient_Id] "+
  "WHERE c.Id = " + caseid
}

function shredUFRecordsDateTimeDataQry(caseid){
  return "UPDATE ["+ cms +"].[dbo].[UFRecordDataDateTime] "+
"SET [Value]=CURRENT_TIMESTAMP "+
"WHERE [Id]    IN( "+ 
  "SELECT idx "+
  "FROM (  "+
  "SELECT MAX(idx) idx,  [Key] ,MAX([Record]) record,MAX([Alias]) alias,MAX([DataType]) dataType,MAX(Val) val "+
   "FROM (SELECT dtdata.idx,  flds.[Key],[Record],[Alias],[DataType],[Val]      "+
  "FROM ["+ cms +"].[dbo].[UFRecordFields] flds   "+
   "INNER JOIN (SELECT MAX(Id) idx, [Key],MAX(Convert(char,[Value])) Val "+
  "FROM ["+ cms +"].[dbo].[UFRecordDataDateTime] "+
  "GROUP BY [Key]) dtdata "+
  "ON flds.[Key] = dtdata.[Key] "+
   ") unifiedData "+
  "GROUP BY [Key] "+
  ") rowdata "+
  "INNER JOIN (SELECT   recs.[Id] "+
		",docs.Case_Id "+    
      ",[UniqueId] "+     
      "FROM ["+ cms +"].[dbo].[UFRecords] recs  "+
      "LEFT JOIN (SELECT  "+
      "[FormEntryId] "+
      ",MAX([Case_Id]) case_id	   "+
      "FROM ["+ emr +"].[dbo].[Documents] "+
      "GROUP BY [FormEntryId]) docs "+
      "ON recs.UniqueId=docs.FormEntryId "+
      "WHERE docs.Case_Id ="+ caseid +") ufrecs "+
      "ON rowdata.record = ufrecs.Id "+
      "WHERE Case_Id ="+ caseid +
      " AND (alias='address' OR alias='address1' OR alias='address2' OR alias='city' OR alias='dateOfBirth' OR alias='emailAddress' OR alias='firstName' "+
      "OR alias='gender' OR alias='lastName' OR alias='middleName' OR alias='mobile' OR alias='phone' OR alias='patientName'))";
}

function shredUFRecordsStringDataQry(caseid){
  return "UPDATE ["+ cms +"].[dbo].[UFRecordDataString] "+
  "SET [Value]='xxxxxxxxxx' "+
  "WHERE [Id]    IN( "+   
   "SELECT idx "+
    "FROM (  "+
    "SELECT MAX(idx) idx,  [Key] ,MAX([Record]) record,MAX([Alias]) alias,MAX([DataType]) dataType,MAX(Val) val "+
     "FROM (SELECT dtdata.idx,  flds.[Key],[Record],[Alias],[DataType],[Val] "+     
    "FROM ["+ cms +"].[dbo].[UFRecordFields] flds  "+ 
     "INNER JOIN (SELECT MAX(Id) idx, [Key],MAX(Convert(char,[Value])) Val "+
    "FROM ["+ cms +"].[dbo].[UFRecordDataString] "+
    "GROUP BY [Key]) dtdata "+
    "ON flds.[Key] = dtdata.[Key] "+  
     ") unifiedData "+
    "GROUP BY [Key] "+
    ") rowdata "+
    "INNER JOIN (SELECT   recs.[Id] "+
      ",docs.Case_Id "+        
        ",[UniqueId] "+         
    "FROM ["+ cms +"].[dbo].[UFRecords] recs  "+
   "LEFT JOIN (SELECT  "+
      "[FormEntryId] "+
      ",MAX([Case_Id]) case_id	   "+
    "FROM ["+ emr +"].[dbo].[Documents] "+
   "GROUP BY [FormEntryId]) docs "+
   "ON recs.UniqueId=docs.FormEntryId "+
    "WHERE docs.Case_Id = " + caseid +" ) ufrecs "+
  
   "ON rowdata.record = ufrecs.Id "+
   "WHERE Case_Id =" + caseid +
  " AND (alias='address' OR alias='address1' OR alias='address2' OR alias='city' OR alias='dateOfBirth' OR alias='emailAddress' OR alias='firstName' "+
   " OR alias='gender' OR alias='lastName' OR alias='middleName' OR alias='mobile' OR alias='phone' OR alias='patientName') )";

}

function shredUFRecordsLongStringDataQry(caseid){
  return "UPDATE ["+ cms +"].[dbo].[UFRecordDataLongString] "+
  "SET [Value]='xxxxxxxxxx' "+
  "WHERE [Id]    IN( "+   
   "SELECT idx "+
    "FROM (  "+
    "SELECT MAX(idx) idx,  [Key] ,MAX([Record]) record,MAX([Alias]) alias,MAX([DataType]) dataType,MAX(Val) val "+
     "FROM (SELECT dtdata.idx,  flds.[Key],[Record],[Alias],[DataType],[Val] "+     
    "FROM ["+ cms +"].[dbo].[UFRecordFields] flds  "+ 
     "INNER JOIN (SELECT MAX(Id) idx, [Key],MAX(Convert(char,[Value])) Val "+
    "FROM ["+ cms +"].[dbo].[UFRecordDataLongString] "+
    "GROUP BY [Key]) dtdata "+
    "ON flds.[Key] = dtdata.[Key] "+  
     ") unifiedData "+
    "GROUP BY [Key] "+
    ") rowdata "+
    "INNER JOIN (SELECT   recs.[Id] "+
        ",docs.Case_Id "+         
        ",[UniqueId] "+        
    "FROM ["+ cms +"].[dbo].[UFRecords] recs  "+
   "LEFT JOIN (SELECT  "+
      "[FormEntryId] "+
      ",MAX([Case_Id]) case_id	   "+
    "FROM ["+ emr +"].[dbo].[Documents] "+
   "GROUP BY [FormEntryId]) docs "+
   "ON recs.UniqueId=docs.FormEntryId "+
    "WHERE docs.Case_Id = " + caseid +" ) ufrecs "+
  
   "ON rowdata.record = ufrecs.Id "+
   "WHERE Case_Id =" + caseid +
  " AND (alias='address' OR alias='address1' OR alias='address2' OR alias='city' OR alias='dateOfBirth' OR alias='emailAddress' OR alias='firstName' "+
   " OR alias='gender' OR alias='lastName' OR alias='middleName' OR alias='mobile' OR alias='phone' OR alias='patientName') )";

}

 
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^


 
function deleteUfRecordsData(caseid){
  return new Promise(function(resolve,reject){ 
    const   case_id=caseid;
    dataservice.query(deletequery(case_id))
    .then(
      resolve("deleted case: " + case_id + " sucessfuly")   
       )    
        })    
}


function shredPatientData(caseid){
  return new Promise(function(resolve,reject){ 
    const   case_id=caseid;
          dataservice.query(shredPatientQry(case_id))
          .then(  
           resolve( deleteUfRecordsData(case_id))  )      
        })    
}

function deleteMessages(caseid){
  return new Promise(function(resolve,reject){ 
    const   case_id=caseid;
          dataservice.query(deleteMessagesqry(case_id))
          .then( res =>
            resolve( shredPatientData(case_id)))        
        })     
}

function deleteChats(caseid){
  return new Promise(function(resolve,reject){ 
    const   case_id=caseid;
          dataservice.query(deleteChatsqry(case_id))
          .then( 
            resolve( deleteMessages(case_id)))        
        })        
}



function deleteUploadedFiles(caseid){
  return new Promise(function(resolve,reject){ 
    const   case_id=caseid;
    rimraf(uploadspath+ case_id,() =>{
      resolve( deleteChats(case_id));
   });   
        })      
}
 

function shredUFRecordsLongStringData(caseid){
  return new Promise(function(resolve,reject){ 
    const   case_id=caseid;
          dataservice.query(shredUFRecordsLongStringDataQry(case_id))
          .then(  
           resolve( deleteUploadedFiles(case_id))  
           )      
        })    
}

function shredUFRecordsStringData(caseid){
  return new Promise(function(resolve,reject){ 
    const   case_id=caseid;
          dataservice.query(shredUFRecordsStringDataQry(case_id))
          .then(  
           resolve( shredUFRecordsLongStringData(case_id))  )      
        })    
}

function shredUFRecordsDateTimeData(caseid){
  return new Promise(function(resolve,reject){ 
    const   case_id=caseid;
          dataservice.query(shredUFRecordsDateTimeDataQry(case_id))
          .then(  
           resolve( shredUFRecordsStringData(case_id))  )      
        })    
}
//deletes all records from UFREcords table for Case_id 
function prune(patientId){
    return new Promise(function(resolve,reject){ 

   getCaseId(patientId) 
.then( caseId =>

      resolve(shredUFRecordsDateTimeData(caseId))  )  
    })
}


  function   getCaseId(patientId){
  return new Promise(function(resolve,reject){ 

    dataservice.query("SELECT Max( [Id]) Id "+
    "FROM  ["+ emr +"].[dbo].[Cases] "+
    "WHERE Patient_Id = " +  patientId)
    .then( res => 
      resolve(res.recordset[0].Id )  )
    
      
  })
}

/*
unction prune(caseid){
    return new Promise(function(resolve,reject){ 
      const case_id= caseid;
      dataservice.query(deletequery(case_id))
      .then(res =>
        resolve(deleteChats(case_id)) )       
    })
}
*/

  
  
  
  
  
  module.exports.prune = prune;
  
  
  
  
  
  
