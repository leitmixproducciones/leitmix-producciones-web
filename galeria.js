import { db } from "./firebase.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


async function cargarGaleria(){

const galeria = document.getElementById("galeria-dinamica");

if(!galeria) return;

galeria.innerHTML = "";

let imagenesMostradas = new Set();

function agregarImagen(url, titulo){

if(imagenesMostradas.has(url)) return;

imagenesMostradas.add(url);

const img = document.createElement("img");

img.src = url;

img.alt = titulo || "Leitmix Producciones";

galeria.appendChild(img);

}


// Galería antigua

try{

const respuesta = await fetch("./content/galeria.json?v=4");

const imagenes = await respuesta.json();

imagenes.forEach(item=>{

agregarImagen(item.image,item.title);

});

}catch(error){

console.log(error);

}


// Firebase

try{

const fotos = await getDocs(collection(db,"galeria"));

fotos.forEach(foto=>{

const datos = foto.data();

agregarImagen(datos.url,datos.titulo);

});

}catch(error){

console.log(error);

}

}


cargarGaleria();
