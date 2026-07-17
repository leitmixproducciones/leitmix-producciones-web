import { supabase } from "./supabase.js";


async function cargarVideos(){

const contenedor = document.getElementById("videos-dinamicos");

if(!contenedor) return;

contenedor.innerHTML = "";


const { data, error } = await supabase
.from("videos")
.select("*");


if(error){

contenedor.innerHTML = "Error: " + error.message;
console.log(error);
return;

}


if(!data || data.length === 0){

contenedor.innerHTML = "No hay videos cargados";
return;

}


data.forEach((item)=>{


const video = document.createElement("video");

const source = document.createElement("source");

source.src = item.Url;
source.type = "video/mp4";


video.appendChild(source);

video.controls = true;
video.preload = "metadata";

video.style.width = "100%";
video.style.maxWidth = "500px";
video.style.margin = "10px";


video.onerror = function(){

console.log("Error cargando video:", item.Url);

};


contenedor.appendChild(video);


});


}


cargarVideos();
