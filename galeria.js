import { supabase } from "./firebase.js";

async function cargarGaleria(){

const galeria = document.getElementById("galeria-dinamica");

if(!galeria) return;

galeria.innerHTML = "";

const { data, error } = await supabase
.from("galeria")
.select("*")
.order("created_at", { ascending: false });


if(error){
console.log(error);
return;
}


data.forEach((foto)=>{

const img = document.createElement("img");

img.src = foto.imagen;

img.alt = foto.titulo || "Leitmix Producciones";

galeria.appendChild(img);

});

}


cargarGaleria();
