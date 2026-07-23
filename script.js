import { supabase } from "./supabase.js";

// LEITMIX PRODUCCIONES
// SCRIPT PRINCIPAL


// WHATSAPP PRESUPUESTO

async function enviarWhatsApp(){

const nombre = document.getElementById("nombre").value;
const telefono = document.getElementById("telefono").value;
const evento = document.getElementById("evento").value;

let fecha = document.getElementById("fecha").value;

console.log("FECHA QUE ENVIA:", fecha);


// Verificar fecha

if(!fecha){

alert("Elegí una fecha para el evento");

return;

}


const invitados = document.getElementById("invitados").value;

// CONVERTIR INVITADOS A NÚMERO O NULL

const invitadosNumero =
    invitados === "" ? null : Number(invitados);

const localidad = document.getElementById("localidad").value;
const comentarios = document.getElementById("comentarios").value;


// OBTENER EL USER_ID DEL DJ DESDE CONFIGURACION

const { data: configuracion, error: errorConfig } = await supabase
.from("configuracion")
.select("user_id")
.limit(1)
.single();

if(errorConfig){

alert(errorConfig.message);

return;

}


// GUARDAR RESERVA EN SUPABASE

const { data, error } = await supabase
.from("reservas")
.insert([
{
nombre: nombre,
telefono: telefono,
evento: evento,
fecha: fecha,
invitados: invitadosNumero,
localidad: localidad,
comentarios: comentarios,
estado: "Pendiente",
user_id: configuracion.user_id
}
])
.select();


console.log("Reserva enviada:", data);
console.log("Error:", error);


if(error){

alert(error.message);

return;

}


alert("Reserva guardada correctamente");


const mensaje =
`Hola Leitmix Producciones, quiero solicitar un presupuesto.

Nombre: ${nombre}
Teléfono: ${telefono}
Evento: ${evento}
Fecha: ${fecha}
Invitados: ${invitados || "No informado"}
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
