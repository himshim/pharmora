/*
 Pharmora Data Engine
 Entity Registry
*/


const PharmoraRegistry = (()=>{


let types={


user:{
    prefix:"USR"
},


organization:{
    prefix:"ORG"
},


resource:{
    prefix:"RES"
},


file:{
    prefix:"FILE"
},


publication:{
    prefix:"PUB"
},


research_paper:{
    prefix:"PAPER"
},


journal:{
    prefix:"JRNL"
},


job:{
    prefix:"JOB"
},


event:{
    prefix:"EVT"
},


category:{
    prefix:"CAT"
},


tag:{
    prefix:"TAG"
},


revision:{
    prefix:"REV"
},


audit:{
    prefix:"AUD"
}


};







function generatePrefix(type){


return type

.split("_")

.map(part=>part[0])

.join("")

.toUpperCase()

.substring(0,5);


}








function get(type){



if(types[type]){

    return types[type];

}





/*
 automatic future support

 example:

 clinical_trial

 becomes

 CT
*/


types[type]={

prefix:
generatePrefix(type),

dynamic:true

};




return types[type];



}








function register(
type,
options
){


types[type]={

...options

};


}







function all(){


return types;


}







return {

get,

register,

all

};



})();