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