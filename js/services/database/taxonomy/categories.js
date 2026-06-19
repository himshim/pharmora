/*
 Pharmora Data Engine
 Category System
*/


const PharmoraCategories = (()=>{



function create({
name,
parent=null,
type="general"
}){



return {


id:

PharmoraReference
.create("category")
.refId,


name,


parent,


type,


createdAt:

new Date()
.toISOString()


};



}









function attach(
entity,
categories=[]
){



return {


...entity,


categories:[


...(entity.categories || []),


...categories


]


};



}








return {

create,

attach

};



})();