import { supabase } from "./supabase.js";


// ======================
// DASHBOARD LEITMIX
// ======================

async function actualizarDashboard(){

const { data, error } = await supabase
.from("reservas")
.select("estado");


if(error){

console.log("Error dashboard:", error);

return;

}


document.getElementById("totalReservasDash").innerText = data.length;


document.getElementById("pendientesDash").innerText =
data.filter(r => r.estado === "Pendiente").length;


document.getElementById("confirmadasDash").innerText =
data.filter(r => r.estado === "Confirmada").length;


}


actualizarDashboard();
