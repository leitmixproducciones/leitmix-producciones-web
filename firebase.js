import { supabase } from "./firebase.js";

async function cargarGaleria(){

const galeria = document.getElementById("galeria-dinamica");

if(!galeria) return;

galeria.innerHTML = "";


const { data, error } = await supabase
.from("galeria")
.select("*");


if(error){

alert(error.message);

return;

}


alert("Registros encontrados: " + data.length);


data.forEach((foto)=>{

const img = document.createElement("img");

img.src = foto.Imagen;

img.alt = foto.Titulo || "Leitmix Producciones";

galeria.appendChild(img);

});

}


cargarGaleria();
