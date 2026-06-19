/*
 Pharmora Storage Engine
 File Manager
*/


const PharmoraFiles = (()=>{



async function hash(file){


let text =
[
file.name,
file.size,
file.type
]
.join("-");


let buffer =
new TextEncoder()
.encode(text);



let digest =
await crypto.subtle.digest(
"SHA-256",
buffer
);



return Array.from(
new Uint8Array(digest)
)

.map(x=>
x.toString(16)
.padStart(2,"0")
)

.join("");



}










async function create(
file,
options={}
){



let ref =
PharmoraReference
.create("file");




return {


id:

PharmoraUUID.create(),


...ref,



name:

file.name,


type:

file.type,


size:

file.size,


extension:

file.name
.split(".")
.pop()
.toLowerCase(),



hash:

await hash(file),



category:

options.category || null,



owner:

options.user || null,



linkedEntity:

options.entity || null,



createdAt:

new Date()
.toISOString()


};



}










return {

create,
hash

};



})();