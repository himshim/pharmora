/*
 Pharmora Data Engine
 Audit Logger
*/


const PharmoraAudit = (()=>{





function create({
action,
target,
user=null,
details={}
}){



return {


id:

PharmoraReference
.create("audit")
.refId,


action,


target,


performedBy:

user,


details,


createdAt:

new Date()
.toISOString()


};



}










function attach(
entity,
audit
){



return {


...entity,


audit:[

...(entity.audit || []),

audit

]


};



}









return {

create,

attach

};



})();