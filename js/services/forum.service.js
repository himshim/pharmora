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

async function createQuestion(data){



let user =
currentUser();



if(!user){


showToast(
"Login required",
"error"
);


return;


}



return await createRecord(

"forum",

{

id:

crypto.randomUUID(),


title:

data.title,


description:

data.description,


category:

data.category,


author:{


id:user.id,


name:user.name,


role:user.role


},


answers:[],


votes:[],


stats:{


views:0,


up:0,


down:0


},


createdAt:

new Date()
.toISOString()


}

);



}



async function canVerifyAnswer(){



return await hasPermission(

"forum.verify"

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

"ANSWER_UPVOTED"

:

"ANSWER_DOWNVOTED"

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

  await addReputation(

target.author.id,

"ANSWER_VERIFIED"

);
  renderForum("forum-list");
}

async function addReputation(
userId,
action
){


if(
typeof addProfileReputation==="function"
){


return addProfileReputation(
userId,
action
);


}


return;


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