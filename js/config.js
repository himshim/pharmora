/*
 Pharmora Configuration
*/


const PHARMORA_CONFIG = {


DATA_PATH:

new URL(
"data/",
window.location.origin + window.location.pathname.split("/").slice(0,2).join("/") + "/"
).href


};