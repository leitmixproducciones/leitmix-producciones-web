import { supabase } from "./supabase.js";

// LEITMIX PRODUCCIONES
// SCRIPT PRINCIPAL


// INICIALIZAR Y BLOQUEAR FECHAS OCUPADAS EN EL CALENDARIO

async function inicializarCalendario() {
  try {
    // Consultar las reservas registradas que NO estén canceladas
    const { data: reservas, error } = await supabase
      .from("reservas")
      .select("fecha")
      .neq("estado", "Cancelado");

    if (error) {
      console.error("Error al obtener fechas ocupadas:", error);
    }

    // Extraer array de fechas ocupadas: ["2026-08-15", "2026-09-20"]
    const fechasOcupadas = reservas ? reservas.map(r => r.fecha) : [];

    // Inicializar Flatpickr en español
    if (typeof flatpickr !== "undefined") {
      flatpickr("#fecha", {
        locale: "es",
        minDate: "today", // Impide elegir fechas pasadas
        dateFormat: "Y-m-d",
        disable: fechasOcupadas, // 🚫 DESHABILITA LAS FECHAS RESERVADAS
        disableMobile: true // Fuerza la interfaz visual personalizada también en teléfonos
      });
    }
  } catch (err) {
    console.error("Error inicializando el calendario:", err);
  }
}


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

// CAPTURAMOS LOS 3 CAMPOS NUEVOS DE LA PLAYLIST
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

// MAPEO A LAS COLUMNAS DE SUPABASE
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


// BOTON WHATSAPP E INICIALIZACIÓN

document.addEventListener("DOMContentLoaded", function(){

// Cargamos el calendario bloqueando fechas ocupadas de Supabase
inicializarCalendario();

const boton = document.getElementById("boton-whatsapp");

if(boton){

boton.addEventListener("click", enviarWhatsApp);

}

});
