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
