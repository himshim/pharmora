/*
 Pharmora SEO
 Schema Generator
*/


const PharmoraSchema = (()=>{





function type(entity){



switch(entity.type){



case "resource":

return "LearningResource";



case "publication":

return "ScholarlyArticle";



case "job":

return "JobPosting";



case "event":

return "Event";



default:

return "CreativeWork";



}



}









function generate(entity){



return {


"@context":

"https://schema.org",


"@type":

type(entity),


"name":

entity.title,


"identifier":

entity.refId


};



}









return {

generate

};



})();