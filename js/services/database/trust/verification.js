/*
 Pharmora Trust Engine
 Verification System
*/


const PharmoraVerification = (()=>{





function verify(
entity,
user=null
){



return {


...entity,


trust:{


...entity.trust,


verified:true,


verifiedBy:user,


verifiedAt:

new Date()
.toISOString(),


score:

(entity.trust?.score || 0)

+

100


}



};



}










function revoke(
entity,
user=null,
reason=""
){



return {


...entity,


trust:{


...entity.trust,


verified:false,


revokedBy:user,


revokedReason:reason,


revokedAt:

new Date()
.toISOString()


}


};



}









return {

verify,

revoke

};



})();