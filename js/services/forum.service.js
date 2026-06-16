/*
 Pharmora Forum Service
 Community + Database Ready
*/

async function getQuestions() {
  try {
    if (typeof getRecords === "function") {
      let data = await getRecords("forum");

      if (data.length) {
        return data;
      }
    }
  } catch (error) {}

  try {
    const response = await fetch(appPath("data/forum.json"));

    return await response.json();
  } catch (error) {
    return [];
  }
}

async function renderForum(id) {
  const root = document.getElementById(id);

  if (!root) {
    return;
  }

  const questions = await getQuestions();

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

  root.innerHTML = questions
    .map(
      (q) => `



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

${q.author?.name || "Community"}


•


${roleBadge(q.author?.role)}


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





${renderAnswers(q)}



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
    .join("");
}

function renderAnswers(q) {
  if (!q.answers || !q.answers.length) {
    return "";
  }

  return q.answers
    .map(
      (a) => `


<div class="card">


<p>

${a.answer}

</p>


<small>

👤 ${a.author?.name || "User"}

•

${roleBadge(a.author?.role)}

</small>

${
  canVerifyAnswer() && !a.verified
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

function roleBadge(role) {
  return (
    {
      owner: "👑 Owner",

      admin: "🛡 Admin",

      moderator: "🛡 Moderator",

      educator: "👨‍🏫 Educator",

      professional: "💊 Professional",

      contributor: "⭐ Contributor",

      student: "🎓 Student",

      member: "Member",
    }[role] || "Member"
  );
}

function canVerifyAnswer(){



let user =

typeof currentUser==="function"

?

currentUser()

:

null;




if(!user){

return false;

}




return [

"owner",

"admin",

"moderator",

"educator",

"professional"

]

.includes(

user.role

);

}

async function replyQuestion(id) {
  let permissions = await userPermissions();

  if (!permissions.includes("*") && !permissions.includes("forum.reply")) {
    showToast("Login required", "error");

    return;
  }

  let text = await openReplyBox();

  if (!text) {
    return;
  }

  let list = await getRecords("forum");

  let q = list.find((x) => x.id === id);

  if (!q) {
    return;
  }

  let user = currentUser();

  let answers = q.answers || [];

  answers.push({
    id: crypto.randomUUID(),

    answer: text,

    verified: false,

   author:{


id:user.id,


name:user.name,


role:user.role


},


createdAt:

new Date()
.toISOString()


});

  await updateRecord(
    "forum",

    id,

    {
      answers: answers,
    },
  );

  renderForum("forum-list");
}

async function voteQuestion(
id,
type
){



let user =
currentUser();



if(!user){



showToast(

"Login required",

"error"

);



return;



}




let permissions =
await userPermissions();




if(

!permissions.includes("*")

&&

!permissions.includes("forum.vote")

){



showToast(

"No permission",

"error"

);



return;



}





let list =
await getRecords(
"forum"
);




let q =
list.find(

x=>x.id===id

);




if(!q){

return;

}





let votes =
q.votes || [];





let already =
votes.find(

x=>x.user===user.id

);




if(already){



showToast(

"You already voted",

"info"

);



return;



}






votes.push({



user:user.id,


type:type,


time:

new Date()
.toISOString()



});





let stats =
q.stats || {};



stats[type] =

(stats[type] || 0)

+

1;





await updateRecord(

"forum",

id,

{


votes:votes,


stats:stats


}

);





await addReputation(

q.author?.id,

type==="up"

?

5

:

-2

);





renderForum(

"forum-list"

);



}

async function reportContent(collection, id) {
  let user = currentUser();

  if (!user) {
    showToast(
      "Login required",

      "error",
    );

    return;
  }

  let reason =
await openReportBox();



if(!reason){

return;

}



  await createRecord(
    "reports",

    {
      collection: collection,

      contentId: id,

      reason: reason,

      reportedBy: {
        id: user.id,

        name: user.name,
      },

      status: "pending",

      createdAt: new Date().toISOString(),
    },
  );

  showToast(
    "Report submitted for review",

    "success",
  );
}

function openReportBox(){



return new Promise(resolve=>{



let modal =
document.createElement(
"div"
);



modal.className =
"community-modal";


modal.style.display =
"flex";




modal.innerHTML=`


<div class="community-box">


<h2>

🚩 Report Content

</h2>




<select id="report-reason">


<option>

Wrong Information

</option>


<option>

Spam

</option>


<option>

Abuse

</option>


<option>

Copyright Issue

</option>


<option>

Other

</option>


</select>



<br><br>




<button

class="btn btn-primary"

id="report-send">

Submit Report

</button>




<button

class="btn"

id="report-close">

Cancel

</button>



</div>


`;





document.body.appendChild(
modal
);





modal.querySelector("#report-send")
.onclick=()=>{



let value =
modal.querySelector(
"#report-reason"
)
.value;




modal.remove();



resolve(value);



};





modal.querySelector("#report-close")
.onclick=()=>{



modal.remove();


resolve(null);


};




});



}

function openReplyBox() {
  return new Promise((resolve) => {
    let modal = document.createElement("div");

    modal.className = "community-modal";

    modal.style.display = "flex";

    modal.innerHTML = `


<div class="community-box">


<h2>

💬 Reply

</h2>



<textarea

id="reply-input"

placeholder="Write helpful answer...">

</textarea>



<br><br>



<button

class="btn btn-primary"

id="reply-send">

Send

</button>



<button

class="btn"

id="reply-close">

Cancel

</button>



</div>


`;

    document.body.appendChild(modal);

    modal.querySelector("#reply-send").onclick = () => {
      let value = modal

        .querySelector("#reply-input")

        .value.trim();

      modal.remove();

      resolve(value);
    };

    modal.querySelector("#reply-close").onclick = () => {
      modal.remove();

      resolve(null);
    };
  });
}

async function verifyAnswer(questionId, answerId) {
  let permissions = await userPermissions();

  if (!permissions.includes("*") && !permissions.includes("forum.verify")) {
    showToast(
      "No permission",

      "error",
    );

    return;
  }

  let list = await getRecords("forum");

  let question =
list.find(

x=>x.id===questionId

);



if(!question){

return;

}



let current =
currentUser();



let target =

(question.answers || [])

.find(

x=>x.id===answerId

);




if(

target?.author?.id

===

current.id

){



showToast(

"You cannot verify your own answer",

"error"

);



return;



}

  

  question.answers = (question.answers || []).map((answer) => {
    if (answer.id === answerId) {
      answer.verified = true;

      answer.verifiedAt = new Date().toISOString();
      let user = currentUser();

      answer.verifiedBy = {
        id: user.id,

        name: user.name,

        role: user.role,
      };
    }

    return answer;
  });

  await updateRecord(
    "forum",

    questionId,

    {
      answers: question.answers,
    },
  );

  showToast(
    "Answer verified",

    "success",
  );

  renderForum("forum-list");
}

async function addReputation(
userId,
points
){



if(!userId){

return;

}



let users =
await getRecords(
"users"
);




let user =
users.find(

x=>x.id===userId

);




if(!user){

return;

}





let reputation =

(user.reputation || 0)

+

points;





await updateRecord(

"users",

userId,

{

reputation:reputation

}

);



checkContributorUpgrade(

userId,

reputation

);



}

async function checkContributorUpgrade(
userId,
score
){



if(score < 100){

return;

}



let user =
currentUser();




if(

user.id===userId

&&

user.role==="member"

){



showToast(

"⭐ You qualify to become a contributor!",

"success"

);



}



}