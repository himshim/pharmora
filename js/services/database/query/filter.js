/*
 Pharmora Data Engine
 Filter Engine
*/


const PharmoraFilter = (()=>{



function match(
item,
filters={}
){


for(
let key in filters
){



let expected =
filters[key];



let actual =
getValue(
item,
key
);




if(Array.isArray(actual)){


if(
!actual.includes(expected)
){

return false;

}


}


else{


if(actual !== expected){

return false;

}


}



}



return true;



}








function getValue(
object,
path
){



return path

.split(".")

.reduce(

(obj,key)=>

obj ?

obj[key]

:

undefined,

object

);



}









function apply(
items,
filters={}
){


return items.filter(

item=>

match(
item,
filters
)

);


}









return {

apply,

match

};



})();