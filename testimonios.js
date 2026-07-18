import { supabase } from "./firebase.js";

const boton = document.getElementById("enviar-testimonio");

boton.addEventListener("click", guardarTestimonio);


async function guardarTestimonio(){

const nombre = document.getElementById("nombre-testimonio").value;
const evento = document.getElementById("evento-testimonio").value;
const comentario = document.getElementById("comentario-testimonio").value;


if(nombre === "" || comentario === ""){

alert("Completá nombre y comentario");
return;

}


const respuesta = await supabase
.from("testimonios")
.insert([
{
nombre:nombre,
evento:evento,
comentario:comentario
}
]);


console.log(respuesta);


if(respuesta.error){

alert("NO SE GUARDO: " + respuesta.error.message);

}else{

alert("TESTIMONIO GUARDADO");

document.getElementById("nombre-testimonio").value="";
document.getElementById("evento-testimonio").value="";
document.getElementById("comentario-testimonio").value="";

}


}
