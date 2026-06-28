
/*
 Generated Pharmora Bundle
 Do not edit directly
*/



    /* ===== js/services/features.service.js ===== */

    
;
/*
 Homepage Feature Renderer
*/


async function renderFeatures(id){


const root =
document.getElementById(id);


if(!root){

return;

}



const features =
await fetch(
"/config/features.json"
)
.then(r=>r.json());





root.innerHTML =
features.map(item=>`


<a 
href="${item.url}"
class="card">


<h2>

${item.icon}
${item.title}

</h2>


<p>

${item.description}

</p>



</a>


`).join("");



}
;


    /* ===== js/services/analytics.service.js ===== */

    
;
/*
 Pharmora Analytics Service
 Privacy Friendly Adapter
*/





let analyticsQueue=[];









function analyticsEnabled(){



return (

localStorage.getItem(

"analytics-disabled"

)

!==

"true"

);



}









function trackEvent(
event,
target=""
){






if(

!analyticsEnabled()

){

return;

}








let data={



id:

crypto.randomUUID(),



event:event,



target:target,



time:

new Date()
.toISOString()



};










analyticsQueue.push(
data
);










saveLocalAnalytics(
data
);











/*

Future Cloud:

supabase
.from("analytics")
.insert(data)

*/







}














function saveLocalAnalytics(data){






let logs =
JSON.parse(

localStorage.getItem(
"analytics"
)

||

"[]"

);








logs.push(
data
);








/*

keep last 100 only

*/



logs =

logs.slice(-100);








localStorage.setItem(

"analytics",

JSON.stringify(logs)

);







}













function getAnalytics(){






return JSON.parse(

localStorage.getItem(

"analytics"

)

||

"[]"

);






}












function clearAnalytics(){






localStorage.removeItem(

"analytics"

);






}












let lastSearch="";









function trackSearch(query){






query =

query.trim();








if(

query.length < 2

){

return;

}









if(

query===lastSearch

){

return;

}








lastSearch=query;








trackEvent(

"search",

query

);






}

/*
=========================
 ANALYTICS REPORTS
=========================
*/


function analyticsSummary(){



let logs =
getAnalytics();




let searches =
logs.filter(

x=>x.event==="search"

);




let views =
logs.filter(

x=>x.event==="view"

);




let downloads =
logs.filter(

x=>x.event==="download"

);






return {


total:

logs.length,



searches:

searches.length,



views:

views.length,



downloads:

downloads.length



};



}









function popularSearches(){



let logs =
getAnalytics()

.filter(

x=>x.event==="search"

);





let count={};





logs.forEach(x=>{


count[x.target] =

(count[x.target] || 0)

+

1;


});








return Object.entries(count)


.sort(

(a,b)=>b[1]-a[1]

)


.slice(0,5);


}










function recentAnalytics(limit=10){



return getAnalytics()


.reverse()


.slice(0,limit);



}

/*
=========================
 ADVANCED ANALYTICS
=========================
*/


function analyticsBars(){



let data =
analyticsSummary();




let highest =
Math.max(

data.searches,

data.views,

data.downloads,

1

);




return [


{
label:"🔎 Searches",
value:data.searches
},


{
label:"👁 Views",
value:data.views
},


{
label:"⬇ Downloads",
value:data.downloads
}


].map(item=>{


return {

...item,


percent:

Math.round(

(item.value/highest)

*

100

)


};



});



}









function topAnalyticsTargets(
event,
limit=5
){



let logs =
getAnalytics()

.filter(

x=>x.event===event

);





let map={};





logs.forEach(x=>{



map[x.target]=

(map[x.target] || 0)

+

1;



});







return Object.entries(map)


.sort(

(a,b)=>b[1]-a[1]

)


.slice(

0,

limit

);



}
;


    /* ===== js/services/activity.service.js ===== */

    
;
/*
 Pharmora Activity Service v2

 Database Provider Based
*/







async function logActivity(
action,
message,
data={}
){



return await createRecord(

"activity",

{


action:action,


message:message,


level:

data.level || "info",



user:

typeof currentUser==="function"

?

currentUser()

:

null,



details:data,



time:

new Date()
.toISOString()


}


);



}










async function getActivities(
limit=20
){



let logs =
await getRecords(
"activity"
);





return logs


.sort((a,b)=>{


return new Date(

b.time || b.metadata?.createdAt

)

-

new Date(

a.time || a.metadata?.createdAt

);


})


.slice(

0,

limit

);



}











async function clearActivities(){



let logs =
await getRecords(
"activity"
);




for(
let item of logs
){


await deleteRecord(
item.id
);


}



}









async function getUserActivities(
userId,
limit=20
){



let logs =
await getActivities(
1000
);




return logs


.filter(x=>{


return (

x.data?.user?.id===userId

||

x.user?.id===userId

);


})


.slice(
0,
limit
);



}









/*
 Export
*/


window.PharmoraActivity = {


logActivity,


getActivities,


clearActivities,


getUserActivities


};





console.log(
"✓ PharmoraActivity ready"
);
;
