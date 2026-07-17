import { supabase } from "./supabase.js";


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
