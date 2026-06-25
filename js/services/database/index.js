/*
 Pharmora Data Engine
 Main Entry Point
*/


const PharmoraDatabase = (()=>{



async function create(
data={},
options={}
){


return PharmoraDB.create(
data,
options
);


}







async function find(
query={}
){


return PharmoraDB.find(
query
);


}








async function update(
id,
updates,
user=null
){


return PharmoraDB.update(
id,
updates,
user
);


}








async function remove(
id,user=null
){


return PharmoraDB.remove(
id,user
);


}









async function publish(
id,
moderator
){



let items =
await find();



let entity =
items.find(

x=>

x.id===id

||

x.refId===id

);



if(!entity){

return null;

}



let updated =
PharmoraModeration.approve(
entity,
moderator
);



return update(
id,
updated,
moderator
);



}











async function rate(
id,
rating
){



let items =
await find();



let entity =
items.find(

x=>

x.id===id

||

x.refId===id

);



if(!entity){

return null;

}



let updated =
PharmoraRating.add(
entity,
rating
);



return update(
id,
updated
);



}











function createBackup(
collections
){


return PharmoraBackupExport.create(
collections
);


}









function restoreBackup(
backup
){


return PharmoraBackupImport.restore(
backup
);


}










return {


create,

find,

update,

remove,


publish,

rate,


backup:createBackup,

restore:restoreBackup


};



})();



/*
 Export Database API
*/

window.PharmoraDatabase =
PharmoraDatabase;