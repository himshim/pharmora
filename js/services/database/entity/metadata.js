/*
 Pharmora Data Engine
 Metadata Module
*/


const PharmoraMetadata = (()=>{


const SCHEMA_VERSION = 1;



function create(user=null){


let now =
new Date()
.toISOString();



return {


schemaVersion:
SCHEMA_VERSION,


createdAt:
now,


updatedAt:
now,


createdBy:
user,


updatedBy:
user,


deleted:false,


deletedAt:null


};


}







function update(old,user=null){



return {


...old,


updatedAt:

new Date()
.toISOString(),


updatedBy:

user ||

old.updatedBy

};



}






return {

create,

update

};



})();