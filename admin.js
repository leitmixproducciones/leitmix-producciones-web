 import { supabase } from "./supabase.js";


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


const nombreArchivo = Date.now() + "-" + archivo.name;


const { error: errorSubida } = await supabase
.storage
.from("media")
.upload("imagenes/" + nombreArchivo, archivo);


if(errorSubida){
alert(errorSubida.message);
return;
}


const { data } = supabase
.storage
.from("media")
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
alert(error.message);
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



const nombreArchivo = Date.now() + "-" + archivo.name;



const { error: errorSubida } = await supabase
.storage
.from("media")
.upload("videos/" + nombreArchivo, archivo);



if(errorSubida){
alert(errorSubida.message);
return;
}



const { data } = supabase
.storage
.from("media")
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
alert(error.message);
return;
}



alert("Video subido correctamente");


archivoVideo.value="";
tituloVideo.value="";


};
