import { supabase } from "./firebase.js";


// MOSTRAR TESTIMONIOS

async function cargarTestimonios(){

const contenedor = document.getElementById("testimonios-dinamicos");

if(!contenedor) return;


const { data, error } = await supabase
.from("testimonios")
.select("*")
.order("created_at", { ascending: false });


if(error){

console.log(error);
return;

}


contenedor.innerHTML = "";


data.forEach(item => {

const div = document.createElement("div");

div.className = "card";

div.innerHTML = `

<h3>${item.nombre}</h3>

<p>${item.evento || ""}</p>

<p>${item.comentario}</p>

`;

contenedor.appendChild(div);

});


}


cargarTestimonios();



// GUARDAR TESTIMONIO

const formulario = document.getElementById("formulario-testimonio");


if(formulario){

formulario.addEventListener("submit", async function(e){

e.preventDefault();


const nombre = document.getElementById("nombre-testimonio").value;
const evento = document.getElementById("evento-testimonio").value;
const comentario = document.getElementById("comentario-testimonio").value;


const { error } = await supabase
.from("testimonios")
.insert([

{

nombre: nombre,
evento: evento,
comentario: comentario

}

]);


if(error){

console.log(error);
alert("Error al enviar comentario");

return;

}


alert("Gracias por dejar tu comentario");


formulario.reset();


cargarTestimonios();


});


}
