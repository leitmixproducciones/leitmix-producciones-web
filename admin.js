 import { supabase } from "./supabase.js";


// GUARDAR IMAGEN

const imagenUrl = document.getElementById("imagenUrl");
const imagenTitulo = document.getElementById("imagenTitulo");
const botonImagen = document.getElementById("guardarImagen");


botonImagen.onclick = async function(){


const { error } = await supabase
.from("galeria")
.insert([
{
Imagen: imagenUrl.value,
Titulo: imagenTitulo.value
}
]);


if(error){

alert(error.message);
return;

}


alert("Imagen guardada correctamente");


imagenUrl.value="";
imagenTitulo.value="";


};




// GUARDAR VIDEO

const videoUrl = document.getElementById("videoUrl");
const videoTitulo = document.getElementById("videoTitulo");
const botonVideo = document.getElementById("guardarVideo");


botonVideo.onclick = async function(){


const { error } = await supabase
.from("videos")
.insert([
{


Titulo: videoTitulo.value,
Url: videoUrl.value
}
]);


if(error){

alert(error.message);
return;

}


alert("Video guardado correctamente");


videoUrl.value="";
videoTitulo.value="";


};
