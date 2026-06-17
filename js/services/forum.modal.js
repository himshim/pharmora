function openReportBox(){



return new Promise(resolve=>{



let modal =
document.createElement(
"div"
);



modal.className =
"community-modal";


modal.style.display =
"flex";




modal.innerHTML=`


<div class="community-box">


<h2>

🚩 Report Content

</h2>




<select id="report-reason">


<option>

Wrong Information

</option>


<option>

Spam

</option>


<option>

Abuse

</option>


<option>

Copyright Issue

</option>


<option>

Other

</option>


</select>



<br><br>




<button

class="btn btn-primary"

id="report-send">

Submit Report

</button>




<button

class="btn"

id="report-close">

Cancel

</button>



</div>


`;





document.body.appendChild(
modal
);





modal.querySelector("#report-send")
.onclick=()=>{



let value =
modal.querySelector(
"#report-reason"
)
.value;




modal.remove();



resolve(value);



};





modal.querySelector("#report-close")
.onclick=()=>{



modal.remove();


resolve(null);


};




});



}

function openReplyBox() {
  return new Promise((resolve) => {
    let modal = document.createElement("div");

    modal.className = "community-modal";

    modal.style.display = "flex";

    modal.innerHTML = `


<div class="community-box">


<h2>

💬 Reply

</h2>



<textarea

id="reply-input"

placeholder="Write helpful answer...">

</textarea>



<br><br>



<button

class="btn btn-primary"

id="reply-send">

Send

</button>



<button

class="btn"

id="reply-close">

Cancel

</button>



</div>


`;

    document.body.appendChild(modal);

    modal.querySelector("#reply-send").onclick = () => {
      let value = modal

        .querySelector("#reply-input")

        .value.trim();

      modal.remove();

      resolve(value);
    };

    modal.querySelector("#reply-close").onclick = () => {
      modal.remove();

      resolve(null);
    };
  });
}