/*
 Pharmora Database Seeder

 Converts legacy JSON content
 into Entity v2 records
*/


const PharmoraSeeder = (()=>{


async function seedCollection(
collection,
url
){


let existing =
await getRecords(
collection
);


if(existing.length){

console.warn(
"Skipping existing:",
collection
);


return {
collection,
skipped:true,
count:existing.length
};


}




let response =
await fetch(url);


let items =
await response.json();




let created=[];




for(
let item of items
){


let entity =
await createRecord(
collection,
item
);


created.push(
entity
);


}




return {

collection,

created:created.length

};


}








async function seedAll(){


let results=[];




results.push(

await seedCollection(
"books",
"/data/books.json"
)

);



results.push(

await seedCollection(
"resources",
"/data/resources.json"
)

);



results.push(

await seedCollection(
"events",
"/data/events.json"
)

);




return results;


}








return {


seedCollection,


seedAll


};



})();






window.PharmoraSeeder =
PharmoraSeeder;




console.log(
"✓ PharmoraSeeder ready"
);