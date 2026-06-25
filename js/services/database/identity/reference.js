/*
 Pharmora Data Engine
 Adaptive Reference ID Generator
*/


const PharmoraReference = (()=>{



const COUNTER_KEY =
"pharmora_identity_counters";







function getCounters(){


try{


return JSON.parse(

localStorage.getItem(
COUNTER_KEY
)

||

"{}"

);


}

catch(e){

return {};

}


}








function saveCounters(data){


localStorage.setItem(

COUNTER_KEY,

JSON.stringify(data)

);


}









function next(prefix,year){



let counters =
getCounters();




if(!counters[prefix]){

counters[prefix]={};

}



if(!counters[prefix][year]){

counters[prefix][year]=0;

}




counters[prefix][year]++;



let value =
counters[prefix][year];



saveCounters(
counters
);



return value;



}










function create(type){



let registry =
PharmoraRegistry.get(type);




let prefix =
registry.prefix;




let year =
new Date()
.getFullYear();




let sequence =
next(
prefix,
year
);




let readable =
String(sequence)
.padStart(
6,
"0"
);






return {


refId:

`${prefix}-${year}-${readable}`,



identity:{


prefix,

year,

sequence,


engine:

"pharmora-data-v2"


}



};



}








return {

create

};



})();

window.PharmoraReference = PharmoraReference;
