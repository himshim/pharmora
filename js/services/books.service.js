/*
 Books Service v2

 Database-first
 JSON fallback
*/


async function getBooks(){



try{


let books =
await getRecords("books");



if(
books &&
books.length
){


return books;


}



}

catch(e){


console.warn(
"Books database unavailable, using JSON fallback"
);


}







const response =
await fetch(
"/data/books.json"
);



return await response.json();



}









async function renderBooks(id){



const root =
document.getElementById(id);



if(!root){

return;

}





const books =
await getBooks();






root.innerHTML =

books.map(book=>`



<div class="card">


<h2>

📚 ${book.title || ""}

</h2>



<p>

${book.description || ""}

</p>



<br>



<div class="badge">

${book.category || ""}

</div>



<br><br>



<p>

Author:
${book.author || "Unknown"}

</p>




${
book.links?.buy

?

`

<br>

<a
class="btn btn-primary"

href="${book.links.buy}"

target="_blank">

View Book

</a>

`

:

""

}



</div>



`).join("");



}