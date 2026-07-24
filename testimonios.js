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
.eq("aprobado", true)
.order("id", { ascending: false });



if(error){

console.log("ERROR LEYENDO TESTIMONIOS:", error);
return;

}



contenedor.innerHTML = "";



data.forEach(item => {


let estrellas = "";

for(let i = 0; i < item.estrellas; i++){
estrellas += "⭐";
}



contenedor.innerHTML += `

<div class="card">

<div class="estrellas">${estrellas}</div>

<h3>${item.nombre}</h3>

<p>${item.evento || ""}</p>

<p>${item.comentario}</p>

</div>

`;

});


}





if(boton){


boton.addEventListener("click", async () => {



const nombre = document.getElementById("nombre-testimonio").value.trim();

const evento = document.getElementById("evento-testimonio").value.trim();

const comentario = document.getElementById("comentario-testimonio").value.trim();

const estrellas = document.getElementById("estrellas-testimonio").value;



if(!nombre || !comentario){

alert("Completá nombre y comentario");

return;

}




const { error } = await supabase

.from("testimonios")

.insert([

{

nombre: nombre,

evento: evento,

comentario: comentario,

estrellas: Number(estrellas),

aprobado: false

}

]);





if(error){

console.log("ERROR GUARDANDO TESTIMONIO:", error);

alert("No se pudo enviar el testimonio");

return;

}





alert("Testimonio enviado correctamente. Será publicado luego de su aprobación.");



document.getElementById("nombre-testimonio").value = "";

document.getElementById("evento-testimonio").value = "";

document.getElementById("comentario-testimonio").value = "";

document.getElementById("estrellas-testimonio").value = "5";



});


}





