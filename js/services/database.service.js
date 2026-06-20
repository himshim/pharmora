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



let cacheKey =

collection +

JSON.stringify(filters);





if(
typeof PharmoraCache !== "undefined"
){


let cached =
PharmoraCache.get(
cacheKey
);



if(cached){

return cached;

}


}








let records =
await PharmoraDatabase.find({


filters:{


collection,


...filters


}


});







if(
typeof PharmoraCache !== "undefined"
){


PharmoraCache.set(

cacheKey,

records

);


}




return records;



}










async function updateRecord(
collection,
id,
updates
){



let result =
await PharmoraDatabase.update(

id,

updates

);




if(
typeof PharmoraCache !== "undefined"
){

PharmoraCache.clear();

}



return result;



}









async function deleteRecord(
collection,
id
){



let result =
await PharmoraDatabase.remove(
id
);




if(
typeof PharmoraCache !== "undefined"
){

PharmoraCache.clear();

}



return result;



}









async function restoreRecord(
collection,
id
){



let result =
await PharmoraDatabase.update(

id,

{

metadata:{

deleted:false,

deletedAt:null

}

}

);




if(
typeof PharmoraCache !== "undefined"
){

PharmoraCache.clear();

}




return result;



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