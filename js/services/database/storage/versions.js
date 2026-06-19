/*
 Pharmora Storage Engine
 File Versions
*/


const PharmoraFileVersions = (()=>{





function create(
oldFile,
newFile,
user=null
){



return {


id:

PharmoraReference
.create("revision")
.refId,



originalFile:

oldFile.refId,



version:

(oldFile.version || 1)+1,



file:

newFile,



uploadedBy:

user,



createdAt:

new Date()
.toISOString()


};



}








return {

create

};



})();