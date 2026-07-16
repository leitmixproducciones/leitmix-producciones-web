import { supabase } from "./firebase.js";


const imagenUrl = document.getElementById("imagenUrl");
const imagenTitulo = document.getElementById("imagenTitulo");
const botonImagen = document.getElementById("guardarImagen");


botonImagen.onclick = async function(){

try{

const { error } = await supabase
.from("galeria")
.insert([
{
titulo: imagenTitulo.value,
imagen: imagenUrl.value
}
]);


if(error) throw error;


alert("Imagen guardada");


imagenUrl.value="";
imagenTitulo.value="";


}catch(error){

alert(error.message);

}

};
