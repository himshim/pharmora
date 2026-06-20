/*
 Pharmora Data Engine
 Core Engine v2.1

 Provider controlled persistence
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

"entities",

query

);





return PharmoraQuery.execute(

records,

query

);



}










async function update(
id,
updates={},
user=null
){



/*
 Provider owns:
 - merging
 - timestamps
 - persistence

 because provider has existing entity
*/


return PharmoraProviders

.get()

.update(

"entities",

id,

updates,

user

);



}










async function remove(
id,user=null)
{



return PharmoraProviders

.get()

.remove(

"entities",

id,

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