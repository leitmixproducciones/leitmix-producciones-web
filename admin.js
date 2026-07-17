import { supabase } from "./supabase.js";

alert("Admin JS cargado");


// SUBIR IMAGEN

const archivoImagen = document.getElementById("imagenArchivo");
const tituloImagen = document.getElementById("imagenTitulo");
const botonImagen = document.getElementById("guardarImagen");


botonImagen.onclick = async function(){

const archivo = archivoImagen.files[0];

if(!archivo){
alert("Elegí una imagen");
return;
}


alert("Subiendo imagen...");


const nombreArchivo = Date.now() + "-" + archivo.name;


const { error: errorSubida } = await supabase
.storage
.from("Media")
.upload("imagenes/" + nombreArchivo, archivo);


if(errorSubida){
console.log(errorSubida);
alert("Error subida: " + errorSubida.message);
return;
}


alert("Archivo subido al Storage");


const { data } = supabase
.storage
.from("Media")
.getPublicUrl("imagenes/" + nombreArchivo);



const { error } = await supabase
.from("galeria")
.insert([
{
Imagen:data.publicUrl,
Titulo:tituloImagen.value
}
]);


if(error){
console.log(error);
alert("Error guardando galería: " + error.message);
return;
}


alert("Imagen subida correctamente");

archivoImagen.value="";
tituloImagen.value="";


};




// SUBIR VIDEO


const archivoVideo = document.getElementById("videoArchivo");
const tituloVideo = document.getElementById("videoTitulo");
const botonVideo = document.getElementById("guardarVideo");


botonVideo.onclick = async function(){


const archivo = archivoVideo.files[0];


if(!archivo){
alert("Elegí un video");
return;
}


alert("Subiendo video...");


const nombreArchivo = Date.now() + "-" + archivo.name;



const { error: errorSubida } = await supabase
.storage
.from("Media")
.upload("videos/" + nombreArchivo, archivo);



if(errorSubida){
console.log(errorSubida);
alert("Error subida video: " + errorSubida.message);
return;
}



alert("Video subido al Storage");



const { data } = supabase
.storage
.from("Media")
.getPublicUrl("videos/" + nombreArchivo);




const { error } = await supabase
.from("videos")
.insert([
{
Titulo:tituloVideo.value,
Url:data.publicUrl
}
]);



if(error){
console.log(error);
alert("Error guardando video: " + error.message);
return;
}



alert("Video subido correctamente");


archivoVideo.value="";
tituloVideo.value="";


};
