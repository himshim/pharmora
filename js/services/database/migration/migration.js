/*
 Pharmora Migration Engine
*/


const PharmoraMigration = (()=>{



let migrations={};





function register(
version,
handler
){


migrations[version]=handler;


}








function migrate(entity){



let current =

entity.metadata
?.schemaVersion

||

1;




while(
migrations[current+1]
){



entity =

migrations[current+1](
entity
);



current++;



}




return entity;



}








return {

register,

migrate

};



})();