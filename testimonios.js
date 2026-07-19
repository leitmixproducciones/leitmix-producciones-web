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



contenedor.innerHTML = "";



data.forEach(item => {


let estrellas = "";

for(let i = 0; i < item.estrellas; i++){
estrellas += "⭐";
}



contenedor.innerHTML += `

<div class="card">

<div>${estrellas}</div>

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
const estrellas = document.getElementById("estrellas-testimonio").
