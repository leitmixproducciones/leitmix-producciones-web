console.log("Leitmix Producciones cargado");

async function cargarGaleria(){

const galeria = document.getElementById("galeria-dinamica");

if(!galeria) return;

try{

const respuesta = await fetch("content/galeria.json");

if(!respuesta.ok){
throw new Error("No se encontró galeria.json");
}

const imagenes = await respuesta.json();

galeria.innerHTML="";


imagenes.forEach(imagen=>{

galeria.innerHTML += `

<img src="${imagen.image}" alt="${imagen.title}">

`;

});


}catch(error){

console.log(error);

galeria.innerHTML = `
<p>No se pudieron cargar las imágenes.</p>
`;

}

}


cargarGaleria();
