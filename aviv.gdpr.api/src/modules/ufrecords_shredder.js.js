
const dataservice = require('../services/dataservice');
const config = require('config');

const db = config.get('sql').database;
 

function ufRecordsQuery(case_id,form){
   return "	SELECT  [record_id] "+
   ",[topic] " +
   ",[case_id] "+
   ",[name] "+
   ",[middlename] "+
   ",[lastname] "+
   ",FORMAT([birthdate], 'yyyy-MM-dd') shortdate "+
   ",CAST([birthdate] AS VARCHAR(7)) daymonth "+ 
   ",DATENAME (month, [birthdate]) as month "+   
   ",DATENAME (year, [birthdate]) as year "+
   ",[xTend.EMR].[dbo].[fnTraverseRecordData]([record_data])					[record_data] "+
   "FROM (SELECT r.Id															[record_id] "+
    ",r.RecordData																[record_data] "+
   ",'forms_'+REPLACE(REPLACE(REPLACE(LOWER(n.[text]),' ','_'),'(',''),')','')	[topic]	"+	
   ",d.Case_Id																	[case_id] "+
   ",pt.FirstName																[name] "+
   ",pt.MiddleName																[middlename] "+
   ",pt.LastName																[lastname] "+
   ",pt.BirthDate																[birthdate] "+
   "FROM ["+ db +"].[dbo].[UFRecords] r  "+

   "INNER JOIN [xTend.EMR].[dbo].Documents d on d.FormEntryId = r.UniqueId "+
   "INNER JOIN [xTend.EMR].[dbo].Cases c on c.Id= d.Case_id "+
   "INNER JOIN [xTend.EMR].[dbo].Patients pt on pt.Id= c.Patient_id "+
   "INNER JOIN ["+ db +"].[dbo].umbracoNode n on n.id = d.DocumantTypeId "+

   ") AS fulldata "+
   "WHERE topic ='" + form +"' AND case_id =" + case_id
}

  
function processRecordData(case_id,data){
    if(data.recordset[0]){
        var recordset =res.recordset[0];
        var recordid= recordset.record_id;
        var name =recordset.name;
        var middlename =recordset.middlename;
        var lastname = recordset.lastname;
        var recorddata= recordset.record_data
        .replace(name,'xxxxxx')
        
        .replace(lastname,'xxxxxxx')
        .replace('Male','xxxxxx')
        .replace('Female','xxxxxxxx');

        if(middlename)
        recorddata =recorddata.replace(middlename,'xxxxxx');        
          
          dataservice.query("SET QUOTED_IDENTIFIER OFF UPDATE ["+ db +"].[dbo].[UFRecords] "+
                  "SET [RecordData]= \""+recorddata +"\" WHERE Id=" +
                              recordid +" SET QUOTED_IDENTIFIER ON")
                                          .then(() =>{
                                          shredMedicalintake(case_id)
                                          .then( 
                                              res => console.log(res))
                                          }
                                            )
                  }
                  else{
                     shredMedicalintake(case_id)
                      .then(
                          res => 
                          console.log(res)
                      )
                  }
}

//changes  fields values for ent referal form data in ufRecords table
function shredEntReferal(caseid){
    return new Promise(function(resolve,reject){
        var case_id=caseid;
       dataservice.query(ufRecordsQuery(caseid,'forms_ent_referral'))
       .then(
           res => {
               processRecordData(case_id,res)
            }

       )
      
    })
   }


//changes  fields values for ent referal form data in ufRecords table
function shredMedicalintake(caseid){
    return new Promise(function(resolve,reject){

       dataservice.query(ufRecordsQuery(caseid,'forms_doctor_intake'))
       .then(
           res => {
          var recordset =res.recordset[0];
          var recordid= recordset.record_id;
          var shortdate = recordset.shortdate.trim();
          var daymonth = recordset.daymonth.trim();
          var month = recordset.month.trim();
          var year = recordset.year.trim();
           
          
          var recorddata= recordset.record_data          
          .replace(new RegExp(shortdate, "g"),"DDMMYYYY")          
          .replace(new RegExp(daymonth, "g"),"ddMM")
          .replace(new RegExp(month, "g"),"MM")
          .replace(new RegExp(year, "g"),"yyyy")
          .replace('Male','xxxxxx')
          .replace('Female','xxxxxxxx');

          recorddata =recorddata.replace(/"/g,'\"')

            //console.log(recorddata);

            dataservice.query("SET QUOTED_IDENTIFIER OFF; UPDATE ["+ db +"].[dbo].[UFRecords] "+
            "SET [RecordData]= \""+recorddata +"\" WHERE Id= " +recordid +" SET QUOTED_IDENTIFIER ON;")
         
            .then(qry =>
                resolve(qry))

          }

       )
      
    })
   }
  

 
  
  
  
  module.exports.shredEntReferal = shredEntReferal;
 