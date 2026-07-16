import { db } from "./firebase.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


async function cargarGaleria(){

const galeria = document.getElementById("galeria-dinamica");

if(!galeria) return;

galeria.innerHTML = "";


const fotos = await getDocs(collection(db,"galeria"));


fotos.forEach((foto)=>{

const datos = foto.data();

const img = document.createElement("img");

img.src = datos.url;

img.alt = datos.titulo || "Leitmix Producciones";

galeria.appendChild(img);

});


}


cargarGaleria();
