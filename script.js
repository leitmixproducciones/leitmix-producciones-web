import { supabase } from "./supabase.js";

// LEITMIX PRODUCCIONES
// SCRIPT PRINCIPAL


// WHATSAPP PRESUPUESTO

async function enviarWhatsApp(){

const nombre = document.getElementById("nombre").value;
const telefono = document.getElementById("telefono").value;
const evento = document.getElementById("evento").value;
const fecha = document.getElementById("fecha").value;
const invitados = document.getElementById("invitados").value;
const localidad = document.getElementById("localidad").value;
const comentarios = document.getElementById("comentarios").value;


// GUARDAR RESERVA EN SUPABASE

const { error } = await supabase
.from("reservas")
.insert([
{
nombre: nombre,
telefono: telefono,
evento: evento,
fecha: fecha,
invitados: invitados,
localidad: localidad,
comentarios: comentarios,
estado: "Pendiente"
}
]);


if(error){

console.log(error);
alert("Error guardando la consulta");

return;

}



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


// BOTON WHATSAPP

document.addEventListener("DOMContentLoaded", function(){

const boton = document.getElementById("boton-whatsapp");


if(boton){

boton.addEventListener("click", enviarWhatsApp);

}

});
