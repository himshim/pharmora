/*
 Pharmora Data Engine
 Moderation System
*/


const PharmoraModeration = (()=>{





function submit(entity,user){



return {


...entity,


lifecycle:{


...entity.lifecycle,


status:

"pending_review",



history:[

...(entity.lifecycle?.history || []),


{

action:"submitted_review",

by:user,

date:

new Date()
.toISOString()

}

]


}


};



}










function approve(entity,moderator){



return {


...entity,


lifecycle:{


...entity.lifecycle,


status:"published",


approvedBy:

moderator,


publishedAt:

new Date()
.toISOString(),



history:[

...(entity.lifecycle?.history || []),


{

action:"approved",

by:moderator,

date:

new Date()
.toISOString()

}

]


}


};



}









function reject(
entity,
moderator,
reason=""
){



return {


...entity,


lifecycle:{


...entity.lifecycle,


status:"rejected",



history:[

...(entity.lifecycle?.history || []),


{

action:"rejected",

reason,

by:moderator,

date:

new Date()
.toISOString()

}

]


}


};



}










return {

submit,

approve,

reject

};



})();