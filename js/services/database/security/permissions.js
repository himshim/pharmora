/*
 Pharmora Security Engine
 Permission Module
*/


const PharmoraPermission = (()=>{



const LEVELS={


guest:0,

member:10,

contributor:20,

researcher:30,

moderator:50,

admin:80,

owner:100


};






function can(
userRole,
required
){


return (

LEVELS[userRole] || 0

)

>=

(

LEVELS[required] || 0

);


}








function require(
entity,
role
){



return {


...entity,


access:{


...(entity.access || {}),


requiredRole:

role


}


};



}








return {

can,

require

};



})();