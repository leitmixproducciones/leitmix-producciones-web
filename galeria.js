import { supabase } from "./firebase.js";

async function cargarGaleria(){

const galeria = document.getElementById("galeria-dinamica");

if(!galeria) return;

galeria.innerHTML = "";


const { data, error } = await supabase
.from("galeria")
.select("*");


if(error){

galeria.innerHTML = "Error: " + error.message;
console.log(error);
return;

}


galeria.innerHTML = "Fotos encontradas: " + data.length;


data.forEach((foto)=>{

const img = document.createElement("img");

img.src = foto.Imagen;

img.alt = foto.Titulo || "Leitmix Producciones";

img.style.width = "300px";

galeria.appendChild(img);

});

}


cargarGaleria();
