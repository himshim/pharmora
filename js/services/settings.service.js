async function loadSettings(){



let box =
document.getElementById(
"settings-content"
);



let user =
currentUser();



if(!user){


box.innerHTML=

`

<div class="card">

Please login first.

</div>

`;


return;


}





let profile =

await getProfile(

user.id

);





box.innerHTML = `



<div

class="setting-card"

onclick="location.href='../profile-edit.html'">


<h2>

👤 Public Profile

</h2>


<p>

Edit your bio, education, work and contact info.

</p>


</div>








<div class="setting-card">


<h2>

✔ Verification

</h2>


<p class="status">


${

profile?.verification?.verified

?

"Verified"

:

"Not verified"

}


</p>


</div>








<div class="setting-card">


<h2>

🌱 Contributor

</h2>



<p class="status">


${

profile?.contributor?.enabled

?

"Contributor"

:

"Not contributor"

}


</p>



</div>









<div

class="setting-card"

onclick="location.href='../components/notification/'">


<h2>

🔔 Notifications

</h2>


<p>

View your updates.

</p>


</div>









<div class="setting-card">


<h2>

🔒 Account

</h2>


<button

class="btn"

onclick="logoutUser()">

Logout

</button>


</div>



`;



}




window.loadSettings =
loadSettings;