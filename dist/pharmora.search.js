
/*
 Generated Pharmora Bundle
 Do not edit directly
*/



    /* ===== js/services/search/config.js ===== */

    
;
/*
 Pharmora Search Config
*/


const SearchConfig = {


collections:[


{
name:"resources",
icon:"📚",
page:"library/view.html"
},


{
name:"books",
icon:"📖",
page:"library/view.html"
},


{
name:"events",
icon:"📅",
page:"library/view.html"
},


{
name:"tools",
icon:"🧰",
page:"library/view.html"
},


{
name:"courses",
icon:"🎓",
page:"learn/"
},


{
name:"curriculums",
icon:"📘",
page:"learn/"
},


{
name:"semesters",
icon:"📅",
page:"learn/"
},


{
name:"subjects",
icon:"🧪",
page:"learn/"
},


{
name:"units",
icon:"📄",
page:"learn/"
},


{
name:"teaching-materials",
icon:"👨‍🏫",
page:"library/view.html"
},


{
name:"question-bank",
icon:"❓",
page:"library/view.html"
},


{
name:"assignments",
icon:"📝",
page:"library/view.html"
}


]


};
;


    /* ===== js/services/search/relations.js ===== */

    
;
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
;


    /* ===== js/services/search/indexer.js ===== */

    
;
/*
 Search Index Builder
*/


const SearchIndexer=(()=>{


let index=[];





async function build(){


index=[];




for(
let source of SearchConfig.collections
){



try{


let data =
await getRecords(source.name);




for(let item of data){



/*
 Public Search Visibility
 Entity v2 + legacy
*/


if(
item.lifecycle
){


if(

item.lifecycle.status !== "published"

||

item.moderation?.status !== "approved"

){


continue;


}


}


else if(
item.status
){


if(
![
"approved",
"active"
]
.includes(
item.status
)
){


continue;


}


}




let hierarchy=[


await SearchRelations.resolve(
"courses",
item.course
),


await SearchRelations.resolve(
"subjects",
item.subject
),


await SearchRelations.resolve(
"units",
item.unit
)


];






let data =
item.data || {};




let keywords=[


item.title,

item.name,

item.description,

item.code,


item.category,

data.category,


item.type,

data.type,


item.author?.name,

item.author,

data.author,


data.course,

data.semester,

data.subject,

data.unit,


...hierarchy,


...(item.tags || []),

...(data.tags || [])


]


.flat()

.filter(Boolean)

.join(" ")

.toLowerCase();





let fallbackURL =
[
"resources",
"books",
"events",
"tools"
]
.includes(source.name)

?

`/library/view.html?id=${item.id}&type=${source.name}`

:

source.page;





let url =

typeof PharmoraRouter !== "undefined"

?

PharmoraRouter.createURL(
item,
source.name
)

:

fallbackURL;






index.push({


...item,


title:
item.title ||
item.name ||
item.code ||
"Untitled",


description:
item.description || "",


icon:
source.icon,


url,

keywords


});



}



}

catch(e){}



}



}





function get(){

return index;

}



return{

build,
get

};


})();
;


    /* ===== js/services/search/ranking.js ===== */

    
;
/*
 Search Ranking
*/


const SearchRanking=(()=>{


function score(item,query){


let points=0;


query =
query.toLowerCase();




if(

item.title

.toLowerCase()

.includes(query)

){

points+=100;

}





if(

item.keywords

.includes(query)

){

points+=50;

}





points +=

(item.views || 0)

*0.1;




points +=

(item.downloads || 0)

*0.5;




if(item.verified){

points+=25;

}



return points;


}



return{

score

};



})();
;


    /* ===== js/services/search/engine.js ===== */

    
;
/*
 Pharmora Search Engine
*/


const PharmoraSearchEngine=(()=>{



async function search(query){



if(

SearchIndexer.get().length===0

){


await SearchIndexer.build();


}





return SearchIndexer

.get()

.map(item=>({


...item,


_score:

SearchRanking.score(
item,
query
)


}))


.filter(

x=>x._score>0

)


.sort(

(a,b)=>b._score-a._score

);



}




return{

search

};



})();
;


    /* ===== js/search.js ===== */

    
;
/*
 Pharmora Search Engine Export
*/

window.PharmoraSearchEngine = PharmoraSearchEngine;

;
