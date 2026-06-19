/*
 Pharmora Data Engine
 Ownership Module
*/


const PharmoraOwnership = (()=>{



function create(user=null){


let contributors = [];


if(user){

contributors.push({

userId:user,

role:"creator",

date:

new Date()
.toISOString()

});

}



return {


ownerId:

user,


verified:

false,


claimedAt:

null,


claimStatus:

user ? "self" : "unclaimed",



claimHistory:

[],


contributors:

contributors


};



}









function transfer(
ownership,
newOwner,
approvedBy,
reason=""
){



return {


...ownership,


ownerId:

newOwner,


verified:

true,


claimStatus:

"verified",


claimedAt:

new Date()
.toISOString(),



claimHistory:[

...(ownership.claimHistory || []),


{

action:

"ownership_transfer",


previousOwner:

ownership.ownerId,


newOwner,


approvedBy,


reason,


date:

new Date()
.toISOString()


}


]


};



}









function addContributor(
ownership,
user,
role="contributor"
){



return {


...ownership,


contributors:[

...(ownership.contributors || []),

{

userId:user,

role,

date:

new Date()
.toISOString()

}

]


};



}










return {

create,

transfer,

addContributor

};



})();