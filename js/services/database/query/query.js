/*
 Pharmora Data Engine
 Query Controller
*/


const PharmoraQuery = (()=>{







function execute(
items,
options={}
){





let result =
[...items];






// search text

if(options.search){


let text =
options.search
.toLowerCase();



result =
result.filter(item=>{


return JSON.stringify(item)

.toLowerCase()

.includes(text);


});


}








// filters


if(options.filters){



result =
PharmoraFilter.apply(

result,

options.filters

);



}









// ranking


if(options.sort==="recommended"){



result =
PharmoraRank.apply(

result

);



}



else{



result =
PharmoraSort.apply(

result,

options.sort

);



}









// pagination


if(options.limit){



let page =
options.page || 1;



let start =

(page-1)

*

options.limit;



result =
result.slice(

start,

start+options.limit

);



}








return result;



}









return {

execute

};



})();