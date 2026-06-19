/*
 Pharmora Data Engine
 Analytics Module
*/


const PharmoraAnalytics = (()=>{



function increase(
entity,
field,
amount=1
){


let analytics =
entity.analytics || {};



return {


...entity,


analytics:{


...analytics,


[field]:

(analytics[field] || 0)

+

amount


}


};



}







function view(entity){


return increase(
entity,
"views"
);


}






function download(entity){


return increase(
entity,
"downloads"
);


}






function like(entity){


return increase(
entity,
"likes"
);


}







function score(entity){



let a =
entity.analytics || {};



return (

(a.views || 0) * 0.1

+

(a.downloads || 0) * 2

+

(a.likes || 0) * 5

);



}







return {

increase,

view,

download,

like,

score

};



})();