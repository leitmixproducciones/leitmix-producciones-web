import { supabase } from "./supabase.js";


document.addEventListener("DOMContentLoaded", () => {


const boton = document.getElementById("enviar-testimonio");


if(!boton){
console.log("No se encontró el botón");
return;
}



boton.addEventListener("click", async () => {


const nombre = document.getElementById("nombre-testimonio").value;
const evento = document.getElementById("evento-testimonio").value;
const comentario = document.getElementById("comentario-testimonio").value;



if(nombre === "" || comentario === ""){

alert("Completá nombre y comentario");
return;

}



const { data, error } = await supabase
.from("testimonios")
.insert([
{
nombre: nombre,
evento: evento,
comentario: comentario
}
])
.select();



if (error) {
  console.log(error);
  alert(error.message);
  return;
}

}



alert("TESTIMONIO GUARDADO");



document.getElementById("nombre-testimonio").value="";
document.getElementById("evento-testimonio").value="";
document.getElementById("comentario-testimonio").value="";



cargarTestimonios();


});




async function cargarTestimonios(){


const contenedor = document.getElementById("testimonios-dinamicos");


if(!contenedor) return;



const { data, error } = await supabase
.from("testimonios")
.select("*")
.order("created_at", { ascending:false });



if(error){

console.log(error);
return;

}



contenedor.innerHTML="";



data.forEach(item=>{


contenedor.innerHTML += `

<div class="card">

<h3>${item.nombre}</h3>

<p>${item.evento || ""}</p>

<p>${item.comentario}</p>

</div>

`;


});


}



cargarTestimonios();


});
