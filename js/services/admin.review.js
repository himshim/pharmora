async function renderAdminActions(){



let box =
document.getElementById(
"admin-actions"
);



if(!box){

return;

}


let title =
document.getElementById(
"section-title"
);



if(title){


title.innerHTML =
"Content Review Queue";


}


let items =
await getAllReviewItems();





let pending =
items.filter(x=>{

return (

x.moderation?.status==="pending"

||

x.status==="pending"

);

});







if(pending.length===0){



box.innerHTML=`


<div class="panel">

Everything reviewed

<span class="status">

✓

</span>

</div>


`;



return;



}









box.innerHTML =

`
<button
class="btn btn-primary"
onclick="AdminWizard.startReviewWizard()">

▶ Start Review Queue

</button>

<br><br>
`

+

pending.map(item=>`





<div class="panel">



<div>



<h3>

${contentIcon(item._collection)}

${

item.title ||

item.question ||

item.name ||

"Untitled"

}

</h3>





<small>


Type:

${item._collection}


<br>


👤

${item.author?.name || "Unknown"}


<br>


🎓

${item.data?.course || item.course || "-"}


<br>


📘

${item.data?.semester || item.semester || "-"}


<br>


🧪

${item.data?.subject || item.subject || "-"}


<br>


🏷

${(item.tags || []).join(", ")}


</small>




</div>








<div>
  <button onclick="PharmoraWorkbench._wb.openViewer({ uuid: '${item.uuid}' })" style="padding:5px 12px;border:1px solid var(--border);background:none;color:var(--text);border-radius:6px;font-weight:600;cursor:pointer;font-size:0.8rem;">
    👁 View & Edit
  </button>
  <button onclick="PharmoraWorkbench._wb._drawerAction('approve','${item.uuid}')" style="padding:5px 12px;border:none;background:var(--primary);color:#fff;border-radius:6px;font-weight:700;cursor:pointer;font-size:0.8rem;">
    ✓ Approve
  </button>
  <button onclick="PharmoraWorkbench._wb._drawerAction('reject','${item.uuid}')" style="padding:5px 12px;border:none;background:#ef4444;color:#fff;border-radius:6px;font-weight:700;cursor:pointer;font-size:0.8rem;">
    ❌ Reject
  </button>
</div>





</div>




`).join("");



}

async function viewContent(
collection,
id
){



let item =
await findContent(
collection,
id
);




if(!item){

return;

}




let html = `


<div class="card">


<div class="badge">

${contentIcon(collection)}

${collection}

</div>



<br><br>



<h1>

${

item.title ||

item.question ||

"Untitled"

}

</h1>





<p>

${

item.description ||

item.data?.description ||

item.data?.answer ||

item.answer ||

""

}

</p>





<br>



<p>


⭐

${item.difficulty || ""}


<br>


🏷

${(item.tags || []).join(", ")}


</p>




</div>


`;





openAdminModal(

html

);


}










async function commentContent(
collection,
id
){



let html = `


<div class="card">


<h2>

💬 Review Comment

</h2>



<p>

Send feedback to contributor

</p>



<br>



<textarea

id="review-message"

placeholder="Write improvement suggestions, approval notes, or rejection reason..."

></textarea>





<br><br>



<button

class="btn btn-primary"

onclick="saveReviewComment('${collection}','${id}')">

Save Comment

</button>



</div>


`;




openAdminModal(

html

);



}

/*
 Review Service Export
*/


window.PharmoraReview = {
  getAllReviewItems: function() {
    return getAllReviewItems();
  },
  renderAdminActions: function() {
    return renderAdminActions();
  },
  approveContent: async function(collection, id) {
    const items = await getAllReviewItems();
    const item = items.find(x => x.id === id && x._collection === collection);
    if (item && item.uuid) {
      await PharmoraEntityReview.approve(item.uuid, 'admin');
      showToast("Approved successfully", "success");
      renderAdminActions();
    }
  },
  rejectContent: async function(collection, id, reason) {
    const items = await getAllReviewItems();
    const item = items.find(x => x.id === id && x._collection === collection);
    if (item && item.uuid) {
      const msg = reason || prompt('Enter rejection reason:');
      if (msg) {
        await PharmoraEntityReview.reject(item.uuid, msg, 'admin');
        showToast("Rejected successfully", "info");
        renderAdminActions();
      }
    }
  },
  viewContent: async function(collection, id) {
    const items = await getAllReviewItems();
    const item = items.find(x => x.id === id && x._collection === collection);
    if (item && item.uuid && window.PharmoraWorkbench && window.PharmoraWorkbench._wb) {
      window.PharmoraWorkbench._wb.openViewer({ uuid: item.uuid });
    } else {
      // Fallback to legacy preview if uuid is missing
      return viewContent(collection, id);
    }
  }
};



console.log(
"✓ PharmoraReview ready"
);