/*
 Pharmora Data Engine
 Core Engine v2
*/


const PharmoraDB = (()=>{






function collectionFor(entity){


return "entities";


}








async function create(
data={},
options={}
){



let entity =
PharmoraEntity.create(
data,
options
);





return PharmoraProviders
.get()
.create(

collectionFor(entity),

entity

);



}










async function find(
query={}
){



let records =
await PharmoraProviders
.get()
.find(

"entities"

);




return PharmoraQuery.execute(

records,

query

);



}










async function update(
id,
updates,
user=null
){



return PharmoraProviders
.get()
.update(

"entities",

id,

{

...updates,


metadata:

PharmoraMetadata.update(

updates.metadata || {},

user

)


}

);



}









async function remove(
id,user=null
){



return update(

id,

{

metadata:{

deleted:true,

deletedAt:

new Date()
.toISOString(),

deletedBy:user

}

},

user

);



}









return {


create,

find,

update,

remove


};



})();