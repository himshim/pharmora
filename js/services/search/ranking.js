/*
 Search Ranking
*/


const SearchRanking=(()=>{


function score(item,query){


let points=0;


query =
query.toLowerCase();




if(

item.title

.toLowerCase()

.includes(query)

){

points+=100;

}





if(

item.keywords

.includes(query)

){

points+=50;

}





points +=

(item.views || 0)

*0.1;




points +=

(item.downloads || 0)

*0.5;




if(item.verified){

points+=25;

}



return points;


}



return{

score

};



})();