/*
 Pharmora Backup Export
*/


const PharmoraBackupExport = (()=>{



function create(
collections={}
){



return {


backupId:

PharmoraReference
.create("backup")
.refId,


engine:

"pharmora-data-v2",


createdAt:

new Date()
.toISOString(),



collections


};



}









function download(data){



let blob =
new Blob(

[
JSON.stringify(
data,
null,
2
)
],

{
type:"application/json"
}

);



let a =
document.createElement("a");



a.href =
URL.createObjectURL(blob);



a.download =
"pharmora-backup.json";



a.click();



}








return {

create,

download

};



})();