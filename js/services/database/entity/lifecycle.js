/*
 Pharmora Data Engine
 Lifecycle Module
*/


const PharmoraLifecycle = (()=>{



function create(){


return {


status:"draft",


version:1,


publishedAt:null,


approvedBy:null,


badges:[],


history:[]


};



}








function publish(
life,
user
){



return {


...life,


status:"published",


publishedAt:

new Date()
.toISOString(),


approvedBy:user,


history:[

...(life.history || []),


{

action:"published",

by:user,

date:

new Date()
.toISOString()

}


]


};



}








return {

create,

publish

};



})();