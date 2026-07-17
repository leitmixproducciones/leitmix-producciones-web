function cargarVideos(){

const contenedor = document.getElementById("videos-dinamicos");

if(!contenedor) return;

contenedor.innerHTML = "";


const videos = [
"assets/video/leitmix-video.mp4",
"assets/video/Fiesta.mp4"
];


videos.forEach((ruta)=>{

const video = document.createElement("video");

video.src = ruta;
video.controls = true;
video.style.width = "100%";
video.style.maxWidth = "500px";
video.style.margin = "10px";


contenedor.appendChild(video);

});

}


cargarVideos();
