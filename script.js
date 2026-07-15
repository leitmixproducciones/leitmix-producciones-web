console.log("Leitmix Producciones web cargada");

async function cargarGaleria(){

const contenedor = document.getElementById("galeria-dinamica");

if(!contenedor) return;

const url = "https://api.github.com/repos/leitmixproducciones/leitmix-producciones-web/contents/content/galeria";

try{

const respuesta = await fetch(url);
const archivos = await respuesta.json();

contenedor.innerHTML = "";

archivos.forEach(async archivo => {

if(archivo.name.endsWith(".md")){

const datos = await fetch(archivo.download_url);
const texto = await datos.text();

const imagen = texto.match(/!\[.*\]\((.*)\)/);

if(imagen){

contenedor.innerHTML += `
<img src="${imagen[1]}" alt="Evento Leitmix">
`;

}

}

});

}catch(error){

contenedor.innerHTML = "<p>No se pudieron cargar las imágenes.</p>";
console.log(error);

}

}

cargarGaleria();
