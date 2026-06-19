/*
 Pharmora Data Engine
 Configuration
*/


const PharmoraConfig = (()=>{


let config = {


engine:

"pharmora-data-v2",



provider:

"local",



features:{


revisions:true,

moderation:true,

seo:true,

analytics:true,

trust:true,

audit:true


},



backup:{


enabled:true,


auto:false


}


};







function get(key=null){


if(!key){

return config;

}


return config[key];


}








function set(
key,
value
){


config[key]=value;


}








function update(
values={}
){



config={

...config,

...values

};



}








return {

get,

set,

update

};



})();