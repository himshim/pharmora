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
 Visibility check
 Entity v2 + legacy
*/


if(
item.lifecycle
){


if(
![
"published",
"draft"
]
.includes(
item.lifecycle.status
)
){

continue;

}


}


else if(
item.status &&
![
"approved",
"active",
"draft"
]
.includes(
item.status
)
){


continue;


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