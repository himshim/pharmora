/*
 Pharmora Version Service
 Content History System
*/



function saveVersion(
collection,
id,
oldData
){



let versions =
JSON.parse(

localStorage.getItem(
"versions"
)

||

"[]"

);





versions.push({


id:

crypto.randomUUID(),


collection:collection,


contentId:id,


data:oldData,


user:

typeof currentUser==="function"

?

currentUser()

:

null,


time:

new Date()
.toISOString()


});







versions =
versions.slice(-500);







localStorage.setItem(

"versions",

JSON.stringify(versions)

);



}









function getVersions(
collection,
id
){



return JSON.parse(

localStorage.getItem(
"versions"
)

||

"[]"

)

.filter(

x=>

x.collection===collection

&&

x.contentId===id

)

.reverse();



}










function clearVersions(){


localStorage.removeItem(
"versions"
);


}