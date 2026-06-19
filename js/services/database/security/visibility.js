/*
 Pharmora Security Engine
 Visibility Module
*/


const PharmoraVisibility = (()=>{





function set(
entity,
visibility="public"
){



return {


...entity,


access:{


...(entity.access || {}),


visibility


}


};



}








function visible(
entity,
userRole="guest"
){



let access =
entity.access || {};



if(
access.visibility==="public"
){

return true;

}




if(
access.visibility==="members"
){


return PharmoraPermission.can(
userRole,
"member"
);


}




if(
access.requiredRole
){


return PharmoraPermission.can(

userRole,

access.requiredRole

);


}



return false;



}









return {

set,

visible

};



})();