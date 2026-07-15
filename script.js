console.log("Leitmix Producciones web cargada");

async function cargarGaleria(){

const contenedor = document.getElementById("galeria-dinamica");

if(!contenedor) return;

try{

const respuesta = await fetch("content/galeria.json");

const imagenes = await respuesta.json();

contenedor.innerHTML = "";

imagenes.forEach(item => {

contenedor.innerHTML += `
<img src="${item.image}" alt="${item.title}">
`;

});

}catch(error){

contenedor.innerHTML = "<p>No hay imágenes disponibles todavía.</p>";

console.log(error);

}

}

cargarGaleria();
