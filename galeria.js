import { db } from "./firebase.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


async function cargarGaleria(){

const galeria = document.getElementById("galeria-dinamica");

if(!galeria) return;

galeria.innerHTML = "";


// Cargar galería antigua
try {

const respuesta = await fetch("./content/galeria.json?v=3");

const imagenes = await respuesta.json();

imagenes.forEach(item => {

const img = document.createElement("img");

img.src = item.image;

img.alt = item.title || "Leitmix Producciones";

galeria.appendChild(img);

});

}catch(error){

console.log("Error galeria antigua",error);

}



// Cargar galería Firebase
try {

const fotos = await getDocs(collection(db,"galeria"));

fotos.forEach((foto)=>{

const datos = foto.data();

const img = document.createElement("img");

img.src = datos.url;

img.alt = datos.titulo || "Leitmix Producciones";

galeria.appendChild(img);

});


}catch(error){

console.log("Error Firebase",error);

}


}


cargarGaleria();
