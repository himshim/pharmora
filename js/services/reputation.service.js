/*
 Pharmora Reputation Service
 Trust + Community Quality
*/


const reputationRules={


ANSWER_UPVOTED:5,


ANSWER_DOWNVOTED:-2,


ANSWER_VERIFIED:25,


CONTENT_REMOVED:-20,


ARTICLE_APPROVED:30,


NOTE_APPROVED:15


};







async function addProfileReputation(
userId,
action
){



if(!userId){

return;

}




let points =
reputationRules[action]

||

0;




if(points===0){

return;

}




let profile =
await getProfile(
userId
);




if(!profile){

return;

}




let current =

profile.stats?.reputation

||

0;





let reputation =

current + points;





let badges =
calculateBadges(

reputation

);






await updateRecord(

"profiles",

profile.id,

{


stats:{


...profile.stats,


reputation:reputation


},



badges:badges



}

);






await createRecord(

"reputation_logs",

{


userId:userId,


action:action,


points:points,


createdAt:

new Date()
.toISOString()


}

);



}









function calculateBadges(score){



let badges=[];



if(score>=100){


badges.push(

"⭐ Active Member"

);


}




if(score>=500){


badges.push(

"💎 Trusted Member"

);


}





if(score>=1000){


badges.push(

"🏆 Community Expert"

);


}





return badges;



}








async function getReputationHistory(userId){



let logs =
await getRecords(

"reputation_logs"

);




return logs.filter(

x=>x.userId===userId

);



}