/*
 Pharmora Data Engine
 Core Engine v2.1

 Provider controlled persistence
*/


const PharmoraDB = (()=>{






function collectionFor(entity){


return entity.type || "entities";


}



async function resolveCollection(id) {
  if (typeof PharmoraRegistry !== "undefined") {
    let types = Object.keys(PharmoraRegistry.all());
    let additionalTypes = ["notifications", "reputation_logs", "verification-requests", "contributor-applications"];
    let allTypes = Array.from(new Set([...types, ...additionalTypes]));
    
    for (let type of allTypes) {
      try {
        let existing = await PharmoraProviders.get().find(type, { id });
        if (existing && existing.length > 0) {
          return type;
        }
      } catch(e) {
        // Ignore
      }
    }
  }
  return "entities"; // Fallback
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



  let targetCollection = query.filters && query.filters.type;
  
  if (targetCollection) {
    let records = await PharmoraProviders.get().find(targetCollection, query);
    return PharmoraQuery.execute(records, query);
  }
  
  // If no type specified, scan all collections
  let allRecords = [];
  if (typeof PharmoraRegistry !== "undefined") {
    let types = Object.keys(PharmoraRegistry.all());
    let additionalTypes = ["notifications", "reputation_logs", "verification-requests", "contributor-applications"];
    let allTypes = Array.from(new Set([...types, ...additionalTypes]));
    
    for (let type of allTypes) {
      try {
        let records = await PharmoraProviders.get().find(type, query);
        if (Array.isArray(records)) {
          allRecords.push(...records);
        }
      } catch(e) {
        // Ignore
      }
    }
  }
  
  return PharmoraQuery.execute(
    allRecords,
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


  let collection = await resolveCollection(id);


return PharmoraProviders

.get()

.update(

collection,

id,

updates,

user

);



}










async function remove(
id,user=null)
{



  let collection = await resolveCollection(id);


return PharmoraProviders

.get()

.remove(

collection,

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



/*
 Export Engine
*/

window.PharmoraDB =
PharmoraDB;