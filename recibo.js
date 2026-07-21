import { supabase } from "./supabase.js";

const params = new URLSearchParams(window.location.search);

const id = params.get("id");


if(!id){

alert("Recibo no encontrado");

throw new Error("Sin ID");

}



const { data, error } = await supabase

.from("recibos")

.select("*")

.eq("id", id)

.single();



if(error){

alert(error.message);

throw error;

}
// ======================
// CARGAR DATOS DEL NEGOCIO
// ======================

const {data:config,error:configError}=await supabase
.from("configuracion")
.select("*")
.limit(1)
.single();


if(!configError && config){

const logo=document.getElementById("logoNegocio");
const nombreNegocio=document.getElementById("nombreNegocio");
const whatsapp=document.getElementById("whatsappNegocio");
const alias=document.getElementById("aliasPago");
const instagram=document.getElementById("instagramNegocio");


if(logo && config.logo){

logo.src=config.logo;

}


if(nombreNegocio){

nombreNegocio.textContent=config.nombre_negocio || "";

}


if(whatsapp){

whatsapp.textContent=config.whatsapp || "";

}


if(alias){

alias.textContent=config.alias_pago || "";

}


if(instagram){

instagram.textContent=config.instagram || "";

}

}

// PRUEBA
alert("Importe recibido: " + data.importe);



document.getElementById("numeroRecibo").textContent =
"RECIBO N.º " + data.numero_recibo;



document.getElementById("nombre").textContent =
data.nombre;



document.getElementById("telefono").textContent =
data.telefono;



document.getElementById("evento").textContent =
data.evento;



document.getElementById("fechaEvento").textContent =
new Date(data.fecha_evento).toLocaleDateString("es-AR");



document.getElementById("concepto").textContent =
data.concepto;



document.getElementById("formaPago").textContent =
data.forma_pago;



// TOTAL DEL EVENTO

document.getElementById("total").textContent =
"$ " + Number(data.total || 0).toLocaleString("es-AR");



// IMPORTE RECIBIDO

document.getElementById("importe").textContent =
"$ " + Number(data.importe || 0).toLocaleString("es-AR");



// SALDO PENDIENTE

document.getElementById("saldoPendiente").textContent =
"$ " + Number(data.saldo_pendiente || 0).toLocaleString("es-AR");



// OBSERVACIONES

document.getElementById("observaciones").textContent =
data.observaciones || "-";




// ======================
// DESCARGAR PDF
// ======================

document
.getElementById("descargarPDF")
.addEventListener("click", () => {

window.print();

});
