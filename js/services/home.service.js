/*
 Pharmora Home Service

 Collects homepage data
*/


async function getHomeStats(){


let collections=[

"resources",
"books",
"events",
"users"

];


let stats={};



for(const c of collections){


try{


let data =
await getRecords(c);


stats[c]=data.length;


}


catch(e){


stats[c]=0;


}


}



return stats;


}






async function getLatestContent(limit=6){


let types=[

"resources",
"books",
"events"

];


let result=[];




for(const type of types){


try{


let data =
await getRecords(type);


result.push(

...data.map(x=>({

...x,

_collection:type

}))


);


}catch(e){}



}




return result

.sort((a,b)=>

new Date(
b.createdAt || 0
)

-

new Date(
a.createdAt || 0
)

)

.slice(0,limit);



}







async function getTrendingContent(limit=6){


let latest =
await getLatestContent(50);



return latest

.sort((a,b)=>{


let as =

(a.views || 0)

+

(a.downloads || 0)*3

+

(a.likes || 0)*5;



let bs =

(b.views || 0)

+

(b.downloads || 0)*3

+

(b.likes || 0)*5;



return bs-as;


})

.slice(0,limit);



}