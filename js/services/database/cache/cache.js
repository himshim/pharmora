/*
 Pharmora Smart Cache
*/


const PharmoraCache = (()=>{


const memory =
new Map();



const TTL =
5 * 60 * 1000;




function set(
key,
data
){


let record={

data,

time:Date.now()

};



memory.set(
key,
record
);



try{


localStorage.setItem(

"cache_"+key,

JSON.stringify(record)

);


}catch(e){}




}








function get(key){



let item =
memory.get(key);



if(!item){


try{


item =
JSON.parse(

localStorage.getItem(
"cache_"+key
)

);


}catch(e){}


}




if(!item){

return null;

}




if(
Date.now()-item.time
>
TTL
){


remove(key);


return null;


}



return item.data;



}








function remove(key){


memory.delete(key);


localStorage.removeItem(
"cache_"+key
);


}








function clear(){


memory.clear();


Object.keys(localStorage)

.filter(x=>

x.startsWith("cache_")

)

.forEach(x=>

localStorage.removeItem(x)

);



}






return{


get,

set,

remove,

clear


};



})();