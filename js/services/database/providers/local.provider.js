/*
 Pharmora Data Engine
 Local Storage Provider
*/


const PharmoraLocalProvider = (()=>{


const PREFIX =
"pharmora_db_";





function key(collection){


return PREFIX + collection;


}






function read(collection){



try{


return JSON.parse(

localStorage.getItem(
key(collection)
)

||

"[]"

);


}


catch(e){


return [];


}



}









function write(
collection,
records
){


localStorage.setItem(

key(collection),

JSON.stringify(records)

);


}










async function create(
collection,
record
){



let items =
read(collection);



items.push(record);



write(
collection,
items
);



return record;



}










async function find(
collection,
options={}
){



let items =
read(collection);



items =
items.filter(

item=>

!item.metadata?.deleted

);



/*
simple filtering
*/


if(options.type){


items =
items.filter(

x=>x.type===options.type

);

}



if(options.subtype){


items =
items.filter(

x=>x.subtype===options.subtype

);

}




return items;



}









async function update(
collection,
id,
updates
){



let items =
read(collection);



let updated=null;



items =

items.map(item=>{


if(item.id===id || item.refId===id){



updated={


...item,


...updates,


metadata:

PharmoraMetadata.update(

item.metadata || {}

)


};



return updated;


}



return item;



});





write(
collection,
items
);



return updated;



}










async function remove(
collection,
id
){



return update(

collection,

id,

{

metadata:{

deleted:true,

deletedAt:

new Date()
.toISOString()

}

}

);



}









return {

create,

find,

update,

remove

};



})();