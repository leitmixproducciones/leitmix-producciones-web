 import { supabase } from "./firebase.js";

async function cargarGaleria(){

const galeria = document.getElementById("galeria-dinamica");

if(!galeria) return;

galeria.innerHTML = "";


const { data, error } = await supabase
.from("galeria")
.select("Titulo, Imagen");


if(error){

galeria.innerHTML = error.message;
return;

}


data.forEach((foto)=>{

const img = document.createElement("img");

img.src = foto.Imagen;

img.alt = foto.Titulo;

img.style.width = "300px";

galeria.appendChild(img);

});

}


cargarGaleria();
