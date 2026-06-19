/*
 Pharmora Data Engine
 Sorting Engine
*/


const PharmoraSort = (()=>{





function apply(
items,
mode="latest"
){



let result =
[...items];




switch(mode){



case "oldest":

return result.sort(

(a,b)=>

new Date(
a.metadata.createdAt
)

-

new Date(
b.metadata.createdAt
)

);





case "most_viewed":

return result.sort(

(a,b)=>

(b.analytics?.views||0)

-

(a.analytics?.views||0)

);





case "most_downloaded":

return result.sort(

(a,b)=>

(b.analytics?.downloads||0)

-

(a.analytics?.downloads||0)

);






case "highest_rated":

return result.sort(

(a,b)=>

(b.trust?.rating?.average||0)

-

(a.trust?.rating?.average||0)

);






case "most_trusted":

return result.sort(

(a,b)=>

(b.trust?.score||0)

-

(a.trust?.score||0)

);






default:

return result.sort(

(a,b)=>

new Date(
b.metadata.createdAt
)

-

new Date(
a.metadata.createdAt
)

);



}



}







return {

apply

};



})();