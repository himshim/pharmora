/*
 Pharmora Router
*/


const PharmoraRouter=(()=>{



function slug(text=""){


return text

.toLowerCase()

.replace(/[^a-z0-9]+/g,"-")

.replace(/^-|-$/g,"");


}






function createURL(item,type){



let title =

item.title ||

item.data?.name ||

item.name ||

item.refId ||

item.id;





if(type==="books"){


return (

"/library/books/" +

slug(title)

);


}





if(type==="resources"){


return (

"/library/resources/" +

slug(title)

);


}






if(type==="events"){


return (

"/events/" +

slug(title)

);


}






if(type==="tools"){


return (

"/tools/" +

slug(title)

);


}







if(

type==="users" ||

type==="profiles"

){


return (

"/profile/" +

slug(title)

);


}







return (

"/view/" +

item.id

);


}




return{

slug,

createURL

};



})();

window.PharmoraRouter = PharmoraRouter;