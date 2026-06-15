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