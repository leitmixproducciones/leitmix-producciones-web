import { db } from "./firebase.js";

import {
doc,
setDoc,
getDoc,
collection,
addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const titulo = document.getElementById("titulo");
const texto = document.getElementById("texto");
const descripcion = document.getElementById("descripcion");
const boton = document.getElementById("guardar");


const imagenUrl = document.getElementById("imagenUrl");
const imagenTitulo = document.getElementById("imagenTitulo");
const botonImagen = document.getElementById("guardarImagen");



async function cargar(){

try{

const ref = doc(db,"web","contenido");

const datos = await getDoc(ref);


if(datos.exists()){

titulo.value = datos.data().titulo || "";

texto.value = datos.data().texto || "";

descripcion.value = datos.data().descripcion || "";

}

}catch(error){

console.log(error);

}

}



boton.onclick = async function(){

await setDoc(
doc(db,"web","contenido"),
{
titulo: titulo.value,
texto: texto.value,
descripcion: descripcion.value
}
);

alert("Contenido guardado");

};





botonImagen.onclick = async function(){

try{

await addDoc(
collection(db,"galeria"),
{
url: imagenUrl.value,
titulo: imagenTitulo.value
}
);


alert("Imagen guardada");


imagenUrl.value="";
imagenTitulo.value="";


}catch(error){

alert(error.message);

}

};



cargar();
