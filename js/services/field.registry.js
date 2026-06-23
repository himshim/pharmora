/*
 Pharmora Field Registry v1
 Smart UI Schema Layer
*/


const PharmoraFields = {


title:{
label:"Title",
type:"text"
},


description:{
label:"Description",
type:"textarea"
},


qualification:{

label:"Qualification",

type:"multi-select",

options:[

"B.Pharm",
"M.Pharm",
"Pharm.D",
"PhD"

],

allowCustom:true

},



categories:{

label:"Categories",

type:"chips",

allowCustom:true

},



tags:{

label:"Tags",

type:"chips",

allowCustom:true

},



remote:{

label:"Remote",

type:"boolean"

},



experience:{

label:"Experience",

type:"number",

min:0

},



location:{

label:"Location",

type:"object-form",

fields:{

country:{
type:"select",
options:[
"India"
],
allowCustom:true
},


state:{
type:"text"
}

}

},



"lifecycle.status":{

label:"Status",

type:"select",

options:[

"draft",
"review",
"published",
"archived"

]

},



seo:{

label:"SEO",

type:"advanced-object"

}



};





function fieldConfig(key){


return (

PharmoraFields[key]

||

{

label:key,

type:"auto",

allowCustom:true

}

);


}