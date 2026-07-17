import { supabase } from "./supabase.js";

async function cargarVideos(){

const contenedor = document.getElementById("videos-dinamicos");

if(!contenedor) return;

contenedor.innerHTML = "";


const { data, error } = await supabase
.from("videos")
.select("id,Titulo,URL");


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


const enlace = document.createElement("a");
enlace.href = video.URL;
enlace.textContent = "Ver video";
enlace.target = "_blank";


contenedor.appendChild(titulo);
contenedor.appendChild(enlace);

});

}


cargarVideos();
