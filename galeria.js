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


if(!data || data.length === 0){

galeria.innerHTML = "No hay imágenes cargadas";

return;

}


alert(JSON.stringify(data));


data.forEach((foto)=>{

const img = document.createElement("img");

img.src = foto.Imagen;

img.alt = foto.Titulo || "Leitmix Producciones";

img.style.width = "300px";
img.style.height = "auto";
img.style.margin = "10px";

galeria.appendChild(img);

});

}


cargarGaleria();
