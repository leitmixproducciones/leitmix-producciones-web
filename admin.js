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



await supabase
.from("galeria")
.insert([
{
Imagen:data.publicUrl,
Titulo:tituloImagen.value
}
]);


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



await supabase
.from("videos")
.insert([
{
Titulo:tituloVideo.value,
Url:data.publicUrl
}
]);


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


const lista = document.getElementById("listaImagenes");


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


await supabase
.from("galeria")
.delete()
.eq("id",id);


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
console.log(error);
return;
}



const lista = document.getElementById("listaVideos");


lista.innerHTML="";


data.forEach(video=>{


lista.innerHTML += `

<div class="item">

<p>${video.Titulo}</p>

<video controls>

<source src="${video.Url}">

</video>


<button class="borrar" onclick="borrarVideo(${video.id})">
Borrar
</button>


</div>

`;

});


}




window.borrarVideo = async function(id){


if(!confirm("¿Borrar video?")) return;


await supabase
.from("videos")
.delete()
.eq("id",id);


cargarVideos();

};




// CARGAR AL ABRIR

cargarImagenes();
cargarVideos();
