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



if(type==="books"){


return (

"/library/books/" +

slug(item.title)

);


}




if(type==="resources"){


return (

"/library/resources/" +

slug(item.title)

);


}





if(type==="tools"){


return (

"/tools/" +

slug(item.title)

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