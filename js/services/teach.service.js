async function loadEducatorPanel(){



let box =
document.getElementById(
"educator-panel"
);



if(!box){

return;

}




let user =
typeof currentUser==="function"

?

currentUser()

:

null;






if(!user){



box.innerHTML=`


<div class="card">


<h2>

🌱 Join Teaching Network

</h2>


<p>

Login to contribute educational resources.

</p>


<br>


<a

href="../auth/login.html"

class="btn btn-primary">

Join Pharmora

</a>


</div>


`;



return;


}







let permissions =
await userPermissions();






if(

permissions.includes("*")

||

permissions.includes("verified.creator")

||

user.role==="educator"

||

user.role==="professional"

){



box.innerHTML=`


<div class="card">


<div class="badge">

⭐ Verified Educator

</div>


<br><br>


<h2>

Welcome ${user.name}

</h2>


<p>

Your educator workspace is active.

</p>


<br>



<div class="grid">


<div class="card"

onclick="location.href='../contribute/'">


<h3>

👨‍🏫 Upload Teaching Material

</h3>


</div>



<div class="card"

onclick="location.href='../library/'">


<h3>

📚 Manage Resources

</h3>


</div>


</div>



</div>


`;



return;


}








if(

permissions.includes("content.submit")

){



box.innerHTML=`


<div class="card">


<h2>

⭐ Contributor Access

</h2>


<p>

You can submit teaching resources for review.

</p>


<br>


<a

href="../contribute/"

class="btn btn-primary">

Open Contributor Studio

</a>


</div>


`;



return;


}










box.innerHTML=`


<div class="card">


<h2>

🌱 Become an Educator Contributor

</h2>


<p>

Start by applying as a contributor and build trust.

</p>


<br>


<a

href="../contribute/"

class="btn btn-primary">

Apply Now

</a>


</div>


`;




}






window.loadEducatorPanel =
loadEducatorPanel;