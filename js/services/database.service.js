/*
 Pharmora Database Service Bridge

 Compatibility layer for old services

 Uses Pharmora Data Engine v2
*/







async function createRecord(
collection,
data={}
){



return PharmoraDatabase.create({


...data,


collection,


type:

data.type ||

collection


});



}










async function getRecords(
collection,
filters={}
){



return PharmoraDatabase.find({


filters:{


collection,


...filters


}


});



}










async function updateRecord(
collection,
id,
updates
){



return PharmoraDatabase.update(

id,

updates

);



}










async function deleteRecord(
collection,
id
){



return PharmoraDatabase.remove(

id

);



}










async function restoreRecord(
collection,
id
){



return PharmoraDatabase.update(

id,

{

metadata:{

deleted:false,

deletedAt:null

}

}

);



}










async function exportDatabase(){



let data =
await PharmoraDatabase.find();



return PharmoraDatabase.backup({

entities:data

});



}










window.DatabaseService={

createRecord,

getRecords,

updateRecord,

deleteRecord,

restoreRecord,

exportDatabase

};




// Legacy global support

window.createRecord =
createRecord;


window.getRecords =
getRecords;


window.updateRecord =
updateRecord;


window.deleteRecord =
deleteRecord;


window.restoreRecord =
restoreRecord;


window.exportDatabase =
exportDatabase;