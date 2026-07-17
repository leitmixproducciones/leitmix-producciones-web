import { supabase } from "./firebase.js";

async function cargarVideos(){

const contenedor = document.getElementById("videos-dinamicos");

if(!contenedor) return;

contenedor.innerHTML = "";


const { data, error } = await supabase
.from("videos")
.select("Titulo, URL");


if(error){

contenedor.innerHTML = "Error: " + error.message;
console.log(error);
return;

}


if(!data || data.length === 0){

contenedor.innerHTML = "No hay videos cargados";

return;

}


data.forEach((video)=>{

const titulo = document.createElement("h3");

titulo.textContent = video.Titulo;


const elemento = document.createElement("video");

elemento.controls = true;
elemento.width = 500;


elemento.innerHTML = `
<source src="${video.URL}" type="video/mp4">
Tu navegador no soporta este video.
`;


contenedor.appendChild(titulo);

contenedor.appendChild(elemento);

});

}


cargarVideos();
