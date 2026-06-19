/*
 Pharmora Backup Import
*/


const PharmoraBackupImport = (()=>{



function validate(data){


return (

data

&&

data.engine

&&

data.collections

);


}






function restore(data){



if(
!validate(data)
){


throw Error(
"Invalid Pharmora backup"
);


}



return data.collections;



}








return {

validate,

restore

};



})();