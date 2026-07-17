import { supabase } from "./supabase.js";


async function cargarVideos(){

const contenedor = document.getElementById("videos-dinamicos");

if(!contenedor) return;

contenedor.innerHTML = "";


const { data, error } = await supabase
.from("videos")
.select("*");


alert(JSON.stringify(data));


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

video.src = item.Url;

video.controls = true;

video.style.width = "100%";
video.style.maxWidth = "500px";
video.style.margin = "10px";


contenedor.appendChild(video);


});


}


cargarVideos();
