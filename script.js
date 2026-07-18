import { supabase } from "./firebase.js";


// GALERIA SUPABASE

async function cargarGaleria(){

const galeria = document.getElementById("galeria-dinamica");

if (!galeria) return;

galeria.innerHTML = "";


const { data, error } = await supabase
.from("galeria")
.select("*")
.order("created_at", { ascending: false });


if(error){

console.log(error);

return;

}


data.forEach(item => {

const img = document.createElement("img");

img.src = item.imagen;

img.alt = item.titulo || "Leitmix Producciones";

galeria.appendChild(img);

});

}


cargarGaleria();

// FORMULARIO PRESUPUESTO WHATSAPP

function enviarWhatsApp(){

const nombre = document.getElementById("nombre").value;
const telefono = document.getElementById("telefono").value;
const evento = document.getElementById("evento").value;
const fecha = document.getElementById("fecha").value;
const invitados = document.getElementById("invitados").value;
const localidad = document.getElementById("localidad").value;
const comentarios = document.getElementById("comentarios").value;


const mensaje = 
`Hola Leitmix Producciones, quiero solicitar un presupuesto.

Nombre: ${nombre}
Teléfono: ${telefono}
Evento: ${evento}
Fecha: ${fecha}
Invitados: ${invitados}
Localidad: ${localidad}

Comentarios:
${comentarios}`;


const url = "https://wa.me/5491150480339?text=" + encodeURIComponent(mensaje);

window.location.href = url;
}

window.enviarWhatsApp = enviarWhatsApp;
