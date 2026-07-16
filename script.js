import { db } from "./firebase.js";

import {
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


async function cargarContenido(){

const ref = doc(db,"web","contenido");

const datos = await getDoc(ref);


if(datos.exists()){

const contenido = datos.data();


const titulo = document.querySelector(".hero h1");

const texto = document.querySelector(".hero p");


if(titulo && contenido.titulo){

titulo.innerHTML = contenido.titulo;

}


if(texto && contenido.texto){

texto.innerHTML = contenido.texto;

}


}

}


cargarContenido();



// GALERIA ORIGINAL

async function cargarGaleria(){

const galeria = document.getElementById("galeria-dinamica");

if (!galeria) return;

galeria.innerHTML = "";

try {

const respuesta = await fetch("./content/galeria.json?v=2");

const imagenes = await respuesta.json();


imagenes.forEach(item => {

const img = document.createElement("img");

img.src = item.image;

img.alt = item.title;

galeria.appendChild(img);

});


} catch(error){

galeria.innerHTML="Error cargando galería";

console.log(error);

}

}


cargarGaleria();
