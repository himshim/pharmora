/*
 Pharmora Trust Engine
 Rating System
*/


const PharmoraRating = (()=>{





function add(
entity,
rating
){



let old =

entity.trust?.rating

||

{
average:0,
count:0
};





let count =

old.count + 1;




let average =

(

(old.average * old.count)

+

rating

)

/

count;







return {


...entity,


trust:{


...entity.trust,


rating:{

average,

count

}


}


};



}










return {

add

};



})();