/*
 Pharmora Data Engine
 Initialization Manager
*/


const PharmoraInit = (()=>{



let ready = false;



const required = [


"PharmoraUUID",

"PharmoraReference",

"PharmoraRegistry",


"PharmoraEntity",

"PharmoraDB",

"PharmoraDatabase",


"PharmoraProviders"


];








function check(){



let missing = [];



required.forEach(name=>{


if(
typeof window[name] === "undefined"
){


missing.push(name);


}


});






if(missing.length){



console.error(

"Pharmora Database missing modules:",

missing

);



ready=false;



return false;


}




ready=true;



console.info(

"✅ Pharmora Data Engine Ready"

);



return true;



}










function isReady(){


return ready;


}









return {


check,

isReady


};



})();