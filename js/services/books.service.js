/*
 Books Service
*/


async function getBooks(){


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

📚 ${book.title}

</h2>



<p>

${book.description}

</p>



<br>



<div class="badge">

${book.category}

</div>



<br><br>



<p>

Author:
${book.author}

</p>




${
book.links.buy
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