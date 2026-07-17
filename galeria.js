async function cargarGaleria(){

const galeria = document.getElementById("galeria-dinamica");

if(!galeria) return;

galeria.innerHTML = "";

const img = document.createElement("img");

img.src = "https://leitmixproducciones.github.io/leitmix-producciones-web/assets/img/leitmix-logo.jpeg";

img.alt = "Leitmix Producciones";

img.style.width = "300px";

galeria.appendChild(img);

}

cargarGaleria();
