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

// 🔽 CAPTURAMOS LOS 3 CAMPOS NUEVOS DE LA PLAYLIST 🔽
const playlistInfaltables = document.getElementById("playlist-infaltables") ? document.getElementById("playlist-infaltables").value : "";
const playlistProhibidos = document.getElementById("playlist-prohibidos") ? document.getElementById("playlist-prohibidos").value : "";
const notasEvento = document.getElementById("notas-evento") ? document.getElementById("notas-evento").value : "";


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
user_id: configuracion.user_id,

// 🔽 MAPEO A LAS COLUMNAS DE SUPABASE 🔽
playlist_infaltables: playlistInfaltables,
playlist_prohibidos: playlistProhibidos,
notas_evento: notasEvento
}
])
.select();


console.log("Reserva enviada:", data);
console.log("Error:", error);


if(error){

alert("Error al guardar en Supabase: " + error.message);

return;

}


alert("Reserva guardada correctamente");


// CONSTRUIR MENSAJE DE WHATSAPP INCLUYENDO LOS CAMPOS DE MÚSICA

const mensaje =
`Hola Leitmix Producciones, quiero solicitar un presupuesto.

Nombre: ${nombre}
Teléfono: ${telefono}
Evento: ${evento}
Fecha: ${fecha}
Invitados: ${invitados || "No informado"}
Localidad: ${localidad}

Comentarios:
${comentarios || "Sin comentarios"}

🔥 Temas Infaltables:
${playlistInfaltables || "No especificó"}

🚫 Temas Prohibidos:
${playlistProhibidos || "No especificó"}

📝 Notas para el DJ:
${notasEvento || "Sin notas adicionales"}`;


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
