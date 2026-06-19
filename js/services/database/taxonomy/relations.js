/*
 Pharmora Data Engine
 Relationship Engine
*/


const PharmoraRelations = (()=>{






function create(
target,
type,
metadata={}
){



return {


target,


type,


metadata,


createdAt:

new Date()
.toISOString()


};



}









function attach(
entity,
relation
){



return {


...entity,


relations:[

...(entity.relations || []),

relation

]


};



}









function findRelated(
entity,
items=[]
){



let ids =

(entity.relations || [])

.map(r=>r.target);




return items.filter(

item=>

ids.includes(

item.refId

)

||

ids.includes(

item.id

)

);



}









return {

create,

attach,

findRelated

};



})();