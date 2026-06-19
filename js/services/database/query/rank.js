/*
 Pharmora Data Engine
 Ranking Engine
*/


const PharmoraRank = (()=>{



function score(item){



let points=0;



points +=

(item.analytics?.views || 0)

*0.1;




points +=

(item.analytics?.downloads || 0)

*0.5;




points +=

(item.trust?.score || 0)

*2;




points +=

(item.trust?.rating?.average || 0)

*10;





if(
item.trust?.verified
){

points +=100;

}



return points;



}









function apply(items){



return [...items]

.sort(

(a,b)=>

score(b)-score(a)

);



}









return {

apply,

score

};



})();