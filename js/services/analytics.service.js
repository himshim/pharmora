/*
 Analytics Service
*/


function trackEvent(
event,
target
){



let data =
{
event:event,

target:target,

time:new Date()
.toISOString()
};





console.log(
"Analytics:",
data
);





/*

Future:

supabase
.from("analytics")
.insert(data)

*/



}









function trackSearch(query){



if(
query.length < 2
){

return;

}




trackEvent(
"search",
query
);



}