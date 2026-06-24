async function renderVerificationCenter(){



let box =
document.getElementById(
"admin-actions"
);



document.getElementById(
"section-title"
)
.innerHTML =
"✔ Verification Requests";





let requests =
await getVerificationRequests();





if(!requests.length){



box.innerHTML =

PharmoraUI.empty(

"No pending verification requests."

);



return;



}







box.innerHTML =

requests.map(req=>


PharmoraUI.card({


title:

"👤 " + req.name,


html:true,


body:

`

${

PharmoraUI.panel({

left:"<b>Email</b>",

right:req.email

})

}


${

PharmoraUI.panel({

left:"<b>Type</b>",

right:req.types.join(", ")

})

}


${

PharmoraUI.panel({

left:"<b>Title</b>",

right:req.details?.title || ""

})

}


${

PharmoraUI.panel({

left:"<b>Organization</b>",

right:req.details?.organization || ""

})

}


${

PharmoraUI.panel({

left:"<b>Attempt</b>",

right:

"#" + (req.attempt || 1)

})

}


${

PharmoraUI.panel({

left:"<b>History</b>",

right:

(req.history || [])

.map(h=>

(h.action || "")

+

(h.reason ? " : "+h.reason : "")

)

.join("<br>")

||

"No history"

})

}

`,


actions:


PharmoraUI.button({

text:"👤 View Profile",

action:

`location.href='../profile.html?id=${req.userId}'`

})


+


PharmoraUI.button({

text:"✔ Approve",

type:"primary",

action:

`adminApproveVerification('${req.id}')`

})


+


PharmoraUI.button({

text:"❌ Reject",

action:

`adminRejectVerification('${req.id}')`

})



})


)
.join("");



}









async function adminApproveVerification(id){



await approveVerification(id);



if(
typeof saveAudit==="function"
){


saveAudit(

"verification.approve",

{

request:id

}

);


}



PharmoraUI.confirm({

title:"Approved ✔",

message:"Verification approved",

confirmText:"OK"

});



renderVerificationCenter();



}










async function adminRejectVerification(id){



return PharmoraUI.prompt({


title:"Reject Verification ❌",


message:

"Enter rejection reason",


placeholder:

"Reason",


confirmText:"Reject",


onConfirm:

`adminRejectVerificationConfirm('${id}')`


});



}




async function adminRejectVerificationConfirm(
id,
reason
){



if(!reason){

return;

}



await rejectVerification(
id,
reason
);




if(

typeof saveAudit==="function"

){


saveAudit(

"verification.reject",

{

request:id,

reason:reason

}

);


}




PharmoraUI.confirm({

title:"Rejected",

message:"Verification rejected",

confirmText:"OK"

});



renderVerificationCenter();



}