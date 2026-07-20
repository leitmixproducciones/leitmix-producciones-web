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

document.getElementById("saldoPendiente").textContent =
data.saldo_pendiente ?? "$ 0";

document.getElementById("observaciones").textContent =
data.observaciones || "-";

document.getElementById("importe").textContent =
Number(data.importe).toLocaleString("es-AR");

// ======================
// DESCARGAR PDF
// ======================

document
.getElementById("descargarPDF")
.addEventListener("click", () => {

window.print();

});
