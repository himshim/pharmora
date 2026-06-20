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



if(

item.status &&

!["approved","active"]

.includes(item.status)

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






let keywords=[


item.title,

item.name,

item.description,

item.code,

item.category,

item.type,

item.author?.name,

...hierarchy,

...(item.tags || [])


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

appPath(
`library/view.html?id=${item.id}&type=${source.name}`
)

:

appPath(source.page);





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