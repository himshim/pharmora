/*
 Pharmora Data Engine
 Revision System
*/


const PharmoraRevision = (()=>{



function create(
entity,
changes,
user=null,
message=""
){



return {


id:

PharmoraReference
.create("revision")
.refId,


entityId:

entity.id,


entityRef:

entity.refId,


version:

(entity.lifecycle?.version || 1)+1,


changes,


message,


createdBy:

user,


status:

"pending",


createdAt:

new Date()
.toISOString()


};



}









function apply(
entity,
revision,
approvedBy=null
){



return {


...entity,


...revision.changes,



lifecycle:{


...entity.lifecycle,


version:

revision.version,


badges:[

...(entity.lifecycle?.badges || []),

"UPDATED"

],



history:[


...(entity.lifecycle?.history || []),


{

action:"revision_applied",

revision:revision.id,

approvedBy,

date:

new Date()
.toISOString()

}


]


},




metadata:

PharmoraMetadata.update(

entity.metadata,

approvedBy

)



};



}









return {

create,

apply

};



})();