/*
 Pharmora Search Engine
*/


const PharmoraSearchEngine=(()=>{



async function search(query){



if(

SearchIndexer.get().length===0

){


await SearchIndexer.build();


}





return SearchIndexer

.get()

.map(item=>({


...item,


_score:

SearchRanking.score(
item,
query
)


}))


.filter(

x=>x._score>0

)


.sort(

(a,b)=>b._score-a._score

);



}




return{

search

};



})();