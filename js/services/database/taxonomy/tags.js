/*
 Pharmora Data Engine
 Tag System
*/


const PharmoraTags = (()=>{



function normalize(tag){


return tag

.toString()

.trim()

.toLowerCase()

.replace(/\s+/g,"-");


}







function create(name){



let key =
normalize(name);



return {


id:

"TAG-" + key.toUpperCase(),


name,


key,


createdAt:

new Date()
.toISOString()


};



}









function attach(
entity,
tags=[]
){



let existing =
entity.tags || [];



return {


...entity,


tags:[

...new Set([

...existing,

...tags.map(normalize)

])

]


};



}









return {

create,

attach,

normalize

};



})();