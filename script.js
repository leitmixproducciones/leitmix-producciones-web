console.log("Leitmix Producciones web cargada");

async function cargarGaleria(){

const contenedor = document.getElementById("galeria-dinamica");

if(!contenedor) return;

try{

const respuesta = await fetch(
"https://api.github.com/repos/leitmixproducciones/leitmix-producciones-web/contents/content/galeria"
);

const archivos = await respuesta.json();

contenedor.innerHTML = "";

for (const archivo of archivos){

if(archivo.name.endsWith(".md")){

const md = await fetch(archivo.download_url);
const texto = await md.text();

const titulo = texto.match(/title:\s*(.*)/);
const imagen = texto.match(/image:\s*(.*)/);

if(imagen){

contenedor.innerHTML += `

<img src="${imagen[1].trim()}" 
alt="${titulo ? titulo[1] : 'Evento Leitmix'}">

`;

}

}

}

}catch(error){

console.log(error);
contenedor.innerHTML="<p>Error cargando galería</p>";

}

}

cargarGaleria();
