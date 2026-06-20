/*
 Search Relationship Resolver
*/


const SearchRelations=(()=>{


let cache={};




async function load(collection){


if(cache[collection]){

return cache[collection];

}



try{


cache[collection]=
await getRecords(collection);


}

catch(e){


cache[collection]=[];


}



return cache[collection];


}







async function resolve(collection,id){


if(!id)return "";



let data =
await load(collection);



let item =
data.find(
x=>x.id===id
);



return item
?
(
item.name ||
item.title ||
item.code ||
""
)
:
"";


}




return{

load,
resolve

};



})();