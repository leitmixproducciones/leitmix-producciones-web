import { supabase } from "./supabase.js";


document.addEventListener("DOMContentLoaded", () => {


const boton = document.getElementById("enviar-testimonio");



async function cargarTestimonios(){


const contenedor = document.getElementById("testimonios-dinamicos");


if(!contenedor){
console.log("No existe contenedor testimonios");
return;
}



const { data, error } = await supabase
.from("testimonios")
.select("*")
.eq("aprobado", true);



if(error){

console.log("ERROR LEYENDO TESTIMONIOS:", error);
return;

}



console.log("TESTIMONIOS APROBADOS:", data);



contenedor.innerHTML = "";



data.forEach(item => {


contenedor.innerHTML += `

<div class="card">

<h3>${item.nombre}</h3>

<p>${item.evento || ""}</p>

<p>${item.comentario}</p>

</div>

`;

});


}





if(boton){


boton.addEventListener("click", async () => {



const nombre = document.getElementById("nombre-testimonio").value;
const evento = document.getElementById("evento-testimonio").value;
const comentario = document.getElementById("comentario-testimonio").value;



if(nombre === "" || comentario === ""){

alert("Completá nombre y comentario");
return;

}




const { data, error } = await supabase
.from("testimonios")
.insert([
{
nombre:nombre,
evento:evento,
comentario:comentario,
aprobado:false
}
])
.select();



console.log("RESULTADO INSERT:", data, error);




if(error){

alert("ERROR: " + error.message);
return;

}




alert("Comentario enviado. Será revisado antes de publicarse.");



document.getElementById("nombre-testimonio").value="";
document.getElementById("evento-testimonio").value="";
document.getElementById("comentario-testimonio").value="";



});


}





cargarTestimonios();



});
