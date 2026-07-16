import { db } from "./firebase.js";

import {
doc,
setDoc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const titulo = document.getElementById("titulo");
const texto = document.getElementById("texto");
const boton = document.getElementById("guardar");


async function cargar(){

const ref = doc(db,"web","contenido");

const datos = await getDoc(ref);

if(datos.exists()){

titulo.value = datos.data().titulo || "";

texto.value = datos.data().texto || "";

}

}


boton.addEventListener("click", async()=>{

await setDoc(
doc(db,"web","contenido"),
{
titulo: titulo.value,
texto: texto.value
}
);

alert("Guardado correctamente");

});


cargar();
