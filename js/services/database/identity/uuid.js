/*
 Pharmora Data Engine
 UUID Identity Module
*/


const PharmoraUUID = (()=>{


function create(){


    if(
        window.crypto &&
        crypto.randomUUID
    ){

        return crypto.randomUUID();

    }



    /*
      fallback for older browsers
    */

    return (

        Date.now().toString(36)

        +

        "-"

        +

        Math.random()
        .toString(36)
        .substring(2,12)

    );


}





return {

    create

};



})();