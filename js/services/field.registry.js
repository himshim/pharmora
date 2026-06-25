/*
 Pharmora Field Registry v2

 Universal schema definitions
*/


(function(){



/* =====================
 FIELD LIBRARY
===================== */


window.PharmoraFields={



title:{
label:"Title",
type:"text",
required:true
},



description:{
label:"Description",
type:"textarea"
},



summary:{
label:"Summary",
type:"textarea",
required:true
},



tags:{
label:"Tags",
type:"chips",
allowCustom:true
},



references:{
label:"References",
type:"textarea"
},



file:{
label:"Attachment",
type:"file"
},



subject:{
label:"Subject",
type:"reference",
collection:"subjects"
},



course:{
label:"Course",
type:"reference",
collection:"courses"
},



drug:{
label:"Drug",
type:"reference",
collection:"drugs",
allowSuggest:true
},



instrument:{
label:"Instrument",
type:"reference",
collection:"instruments",
allowSuggest:true
},



organization:{
label:"Organization",
type:"reference",
collection:"organizations",
allowSuggest:true
}



};







/* =====================
 HELPER
===================== */


window.fieldConfig=function(key){


return (

PharmoraFields[key]

||

{
key,
label:key,
type:"text",
allowCustom:true
}

);


};










/* =====================
 REGISTER CONTENT TYPES
===================== */


function build(keys){


return keys.map(k=>({

key:k,

...fieldConfig(k)

}));


}








if(window.PharmoraSchema){





/* Research */


PharmoraSchema.register(

"research",

{

version:1,


fields:build([

"title",

"summary",

"subject",

"drug",

"instrument",

"organization",

"references"

])


}

);










/* Drugs */


PharmoraSchema.register(

"drugs",

{

version:1,


fields:[


...build([
"title"
]),



{
key:"drugClass",
label:"Drug Class",
type:"reference",
collection:"drugClasses",
required:true
},


{
key:"mechanism",
label:"Mechanism of Action",
type:"textarea"
},



{
key:"uses",
label:"Uses",
type:"textarea"
},



{
key:"adverseEffects",
label:"Adverse Effects",
type:"textarea"
}



]


}

);










/* Documents */


PharmoraSchema.register(

"documents",

{

version:1,

fields:build([

"title",

"summary",

"organization",

"references",

"file"

])

}

);









/* Jobs */


PharmoraSchema.register(

"jobs",

{

version:1,


fields:[


...build([
"title",
"organization"
]),



{
key:"qualification",
label:"Qualification",
type:"text"
},



{
key:"experience",
label:"Experience",
type:"number"
},



{
key:"applyLink",
label:"Apply Link",
type:"url"
}



]


}

);









/* Practicals */


PharmoraSchema.register(

"practicals",

{

version:1,

fields:[


...build([
"title",
"subject"
]),



{
key:"aim",
label:"Aim",
type:"textarea",
required:true
},



{
key:"procedure",
label:"Procedure",
type:"textarea"
},



{
key:"result",
label:"Result",
type:"textarea"
}


]


}

);






console.log(

"✓ Field Registry Loaded"

);



}




})();