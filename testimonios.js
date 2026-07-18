import { supabase } from "./firebase.js";


// CARGAR TESTIMONIOS

async function cargarTestimonios(){

const contenedor = document.getElementById("testimonios-dinamicos");

if(!contenedor) return;


const { data, error } = await supabase
.from("testimonios")
.select("*")
.order("created_at", { ascending:false });


if(error){

console.log("ERROR CARGANDO:", error);
return;

}


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


// GUARDAR TESTIMONIO

document.addEventListener("DOMContentLoaded", () => {


const boton = document.getElementById("enviar-testimonio");


if(!boton){

console.log("NO ENCUENTRO BOTON TESTIMONIO");
return;

}


boton.addEventListener("click", async () => {


const nombre = document.getElementById("nombre-testimonio").value.trim();

const evento = document.getElementById("evento-testimonio").value.trim();

const comentario = document.getElementById("comentario-testimonio").value.trim();



if(nombre === "" || comentario === ""){

alert("Completá nombre y comentario");
return;

}



const { data, error } = await supabase

.from("testimonios")

.insert([

{

nombre: nombre,

evento: evento,

comentario: comentario

}

])

.select();



console.log("SUPABASE RESPUESTA:", data, error);



if(error){

alert("Error al guardar comentario");

return;

}



alert("Comentario enviado correctamente");



document.getElementById("nombre-testimonio").value = "";

document.getElementById("evento-testimonio").value = "";

document.getElementById("comentario-testimonio").value = "";



cargarTestimonios();



});


cargarTestimonios();


});
