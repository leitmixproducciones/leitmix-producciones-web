import { supabase } from "./supabase.js";


// ======================
// SUBIR IMAGEN
// ======================

const archivoImagen = document.getElementById("imagenArchivo");
const tituloImagen = document.getElementById("imagenTitulo");
const botonImagen = document.getElementById("guardarImagen");


botonImagen.onclick = async () => {

const archivo = archivoImagen.files[0];

if(!archivo){
alert("Elegí una imagen");
return;
}


const nombreArchivo = Date.now() + "-" + archivo.name;


const { error } = await supabase.storage
.from("Media")
.upload("imagenes/" + nombreArchivo, archivo);


if(error){
alert(error.message);
return;
}


const { data } = supabase.storage
.from("Media")
.getPublicUrl("imagenes/" + nombreArchivo);



const { error: errorDB } = await supabase
.from("galeria")
.insert([
{
Imagen:data.publicUrl,
Titulo:tituloImagen.value
}
]);


if(errorDB){
alert(errorDB.message);
return;
}


alert("Imagen subida correctamente");


archivoImagen.value="";
tituloImagen.value="";

cargarImagenes();

};




// ======================
// SUBIR VIDEO
// ======================

const archivoVideo = document.getElementById("videoArchivo");
const tituloVideo = document.getElementById("videoTitulo");
const botonVideo = document.getElementById("guardarVideo");


botonVideo.onclick = async () => {

const archivo = archivoVideo.files[0];

if(!archivo){
alert("Elegí un video");
return;
}


const nombreArchivo = Date.now() + "-" + archivo.name;


const { error } = await supabase.storage
.from("Media")
.upload("videos/" + nombreArchivo, archivo);


if(error){
alert(error.message);
return;
}


const { data } = supabase.storage
.from("Media")
.getPublicUrl("videos/" + nombreArchivo);



const { error: errorDB } = await supabase
.from("videos")
.insert([
{
Titulo:tituloVideo.value,
Url:data.publicUrl
}
]);


if(errorDB){
alert(errorDB.message);
return;
}


alert("Video subido correctamente");


archivoVideo.value="";
tituloVideo.value="";


cargarVideos();

};




// ======================
// MOSTRAR IMAGENES
// ======================

async function cargarImagenes(){

const { data, error } = await supabase
.from("galeria")
.select("*")
.order("id",{ascending:false});


if(error){
console.log(error);
return;
}


const lista=document.getElementById("listaImagenes");

lista.innerHTML="";


data.forEach(imagen=>{


lista.innerHTML += `

<div class="item">

<img src="${imagen.Imagen}">

<p>${imagen.Titulo}</p>

<button class="borrar" onclick="borrarImagen(${imagen.id})">
Borrar
</button>

</div>

`;

});


}




window.borrarImagen = async function(id){


if(!confirm("¿Borrar imagen?")) return;


const { error } = await supabase
.from("galeria")
.delete()
.eq("id",id);


if(error){
alert(error.message);
return;
}


alert("Imagen borrada");

cargarImagenes();

};




// ======================
// MOSTRAR VIDEOS
// ======================

async function cargarVideos(){


const { data, error } = await supabase
.from("videos")
.select("*")
.order("id",{ascending:false});


if(error){
console.log(error
