async function getAuthorInfo(user){



if(
!user?.id ||
typeof getProfile!=="function"
){

return {

name:user?.name || "Community",

subtitle:"Member",

badges:[]

};

}



let profile =
await getProfile(
user.id
);



if(!profile){


return {

name:user.name,

subtitle:"Member",

badges:[]

};


}



let badges=[];




if(

profile.verification?.verified

){


badges.push(

"✔ Verified"

);


}




if(

profile.contributor?.enabled

){


badges.push(

"🌱 Contributor"

);


}




return {


name:

profile.displayName || user.name,



subtitle:

[

...(profile.types || []),

...(profile.specializations || [])

]

.slice(0,2)

.join(" • ")



||


"Member",



badges:badges,



reputation:

profile.stats?.reputation || 0



};



}

async function renderForum(id) {
  const root = document.getElementById(id);

  if (!root) {
    return;
  }

  const questions = await getQuestions();

  for(

let q of questions

){


q.authorInfo =
await getAuthorInfo(
q.author
);


}

  if (!questions.length) {
    root.innerHTML = `


<div class="card">


<h2>

💬 No discussions yet

</h2>


<p>

Start the first pharmacy discussion.

</p>


</div>


`;

    return;
  }

  let html =
await Promise.all(

questions.map(

async(q)=>`



<div class="card">



<h2>

💬 ${q.title}

</h2>




<p>

${q.description || ""}

</p>






<br>




<div class="badge">

${q.category || "Discussion"}

</div>






<br><br>






<p>


👤 

<a href="${appPath('profile.html')}?id=${q.author?.id}">

${q.authorInfo.name}

</a>


<br>


${q.authorInfo.subtitle}


<br>


${

q.authorInfo.badges.join(" ")

}


<br>


⭐ ${q.authorInfo.reputation}


</p>








<p>

👁 ${q.stats?.views || 0}

&nbsp;

👍 ${q.stats?.up || 0}

&nbsp;

👎 ${q.stats?.down || 0}

</p>



<div>


<button onclick="voteQuestion('${q.id}','up')">

👍

</button>



<button onclick="voteQuestion('${q.id}','down')">

👎

</button>



<button onclick="replyQuestion('${q.id}')">

💬 Reply

</button>



<button onclick="reportContent('forum','${q.id}')">

🚩

</button>


</div>





${await renderAnswers(q)}



${
  (q.answers || []).some((a) => a.verified)
    ? `

<br>


<div class="badge">


✓ Verified Answer


</div>


`
    : ""
}







</div>


`,
 )

);

root.innerHTML =
html.join("");

}

async function renderAnswers(q) {
  if (!q.answers || !q.answers.length) {
    return "";
  }

  let verifyAllowed =
await canVerifyAnswer();

for(

let a of q.answers

){


a.authorInfo =
await getAuthorInfo(
a.author
);


}

q.answers =
q.answers.map(a=>({

...a,

canVerify:verifyAllowed

}));

  return q.answers
    .map(
      (a) => `


<div class="card">


<p>

${a.answer}

</p>


<small>

👤

<a href="${appPath('profile.html')}?id=${a.author?.id}">

${a.authorInfo.name}

</a>


<br>


${a.authorInfo.subtitle}


<br>


${a.authorInfo.badges.join(" ")}


<br>


⭐ ${a.authorInfo.reputation}

</small>

${
  a.canVerify && !a.verified
    ? `

<br>

<button onclick="verifyAnswer('${q.id}','${a.id}')">

✓ Verify

</button>

`
    : ""
}

${
  a.verified
    ? `

<br>


<div class="badge">

✓ Verified by

${a.verifiedBy?.name || "Educator"}

</div>



`
    : ""
}


</div>


`,
    )
    .join("");
}

function roleBadge(role){



return ({

owner:"👑 Owner",

admin:"🛡 Admin",

maintainer:"🔧 Maintainer",

moderator:"🛡 Moderator",

member:"Member"


}[role] || "Member");



}