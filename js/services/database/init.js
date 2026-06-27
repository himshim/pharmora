/*
 Pharmora Data Engine
 Initialization Manager
*/


const PharmoraInit = (()=>{



let ready = false;



const required = [


"PharmoraUUID",

"PharmoraReference",

"PharmoraRegistry",


"PharmoraEntity",

"PharmoraDB",

"PharmoraDatabase",


"PharmoraProviders"


];








function check(){



let missing = [];



required.forEach(name=>{


if(
typeof window[name] === "undefined"
){


missing.push(name);


}


});






if(missing.length){



console.error(

"Pharmora Database missing modules:",

missing

);



ready=false;



return false;


}




ready=true;



  // Self-healing database migration path:
  if (localStorage.getItem("pharmora_db_entities")) {
    try {
      let oldEntities = JSON.parse(localStorage.getItem("pharmora_db_entities") || "[]");
      if (Array.isArray(oldEntities) && oldEntities.length > 0) {
        console.info("Migrating legacy entities database to separate collections...");
        let collections = {};
        oldEntities.forEach(entity => {
          let type = entity.type || "entities";
          if (!collections[type]) {
            collections[type] = [];
          }
          collections[type].push(entity);
        });
        
        Object.keys(collections).forEach(type => {
          let collectionKey = "pharmora_db_" + type;
          let existing = JSON.parse(localStorage.getItem(collectionKey) || "[]");
          let merged = [...existing];
          collections[type].forEach(item => {
            if (!merged.find(x => x.id === item.id)) {
              merged.push(item);
            }
          });
          localStorage.setItem(collectionKey, JSON.stringify(merged));
        });
        
        console.info("Migration successful! Cleaning up legacy database reference...");
        localStorage.removeItem("pharmora_db_entities");
      }
    } catch(e) {
      console.error("Database migration failed:", e);
    }
  }


  if(typeof PharmoraSeeder !== "undefined"){
    PharmoraSeeder.seedAll().then(res=>{
      console.info("Database seeded:", res);
    }).catch(err=>{
      console.warn("Seeding failed:", err);
    });
  }

  return true;



}










function isReady(){


return ready;


}









return {


check,

isReady


};



})();

window.PharmoraInit = PharmoraInit;