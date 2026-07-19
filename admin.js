import { supabase } from "./supabase.js";


// ======================
// SUBIR IMAGEN
// ======================

const archivoImagen = document.getElementById("imagenArchivo");
const tituloImagen = document.getElementById("imagenTitulo");
const botonImagen = document.getElementById("guardarImagen");


if(botonImagen){

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

}



// ======================
// SUBIR VIDEO
// ======================

const archivoVideo = document.getElementById("videoArchivo");
const tituloVideo = document.getElementById("videoTitulo");
const botonVideo = document.getElementById("guardarVideo");


if(botonVideo){

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

}



// ======================
// IMAGENES
// ======================

async function cargarImagenes(){

const lista = document.getElementById("listaImagenes");

if(!lista) return;


const { data, error } = await supabase
.from("galeria")
.select("*")
.order("id",{ascending:false});


if(error){
console.log(error);
return;
}


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
// VIDEOS
// ======================

async function cargarVideos(){

const lista = document.getElementById("listaVideos");

if(!lista) return;


const { data, error } = await supabase
.from("videos")
.select("*")
.order("id",{ascending:false});


if(error){
console.log(error);
return;
}


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




// ======================
// TESTIMONIOS
// ======================

async function cargarTestimonios(){

const lista = document.getElementById("listaTestimonios");

if(!lista) return;


const { data, error } = await supabase
.from("testimonios")
.select("*")
.order("id",{ascending:false});


if(error){
console.log(error);
return;
}


lista.innerHTML="";


data.forEach(testimonio=>{


lista.innerHTML += `

<div class="item">

<h3>${testimonio.nombre}</h3>

<p>${testimonio.evento || ""}</p>

<p>${testimonio.comentario}</p>

<p>⭐ ${testimonio.estrellas}</p>


<p>
${testimonio.aprobado ? "🟢 Publicado" : "🟡 Pendiente"}
</p>


${
testimonio.aprobado

?

`<button onclick="ocultarTestimonio(${testimonio.id})">
Ocultar
</button>`

:

`<button onclick="aprobarTestimonio(${testimonio.id})">
Aprobar
</button>`

}


<button class="borrar" onclick="borrarTestimonio(${testimonio.id})">
Borrar
</button>


</div>

`;

});


}




window.aprobarTestimonio = async function(id){

await supabase
.from("testimonios")
.update({
aprobado:true
})
.eq("id",id);


cargarTestimonios();

};



window.ocultarTestimonio = async function(id){

await supabase
.from("testimonios")
.update({
aprobado:false
})
.eq("id",id);


cargarTestimonios();

};



window.borrarTestimonio = async function(id){

if(!confirm("¿Borrar testimonio?")) return;


await supabase
.from("testimonios")
.delete()
.eq("id",id);


cargarTestimonios();

};




// ======================
// INICIO
// ======================

cargarImagenes();

cargarVideos();

cargarTestimonios();

// ======================
// RESERVAS
// ======================

async function cargarReservas(){

const lista = document.getElementById("listaReservas");

if(!lista) return;


const { data, error } = await supabase
.from("reservas")
.select("*")
.order("id",{ascending:false});


if(error){
console.log(error);
return;
}


lista.innerHTML="";


data.forEach(reserva=>{


lista.innerHTML += `

<div class="item">

<h3>${reserva.nombre}</h3>

<p>📞 ${reserva.telefono}</p>

<p>📍 ${reserva.localidad}</p>

<p>🎉 Evento: ${reserva.evento}</p>

<p>📅 Fecha: ${reserva.fecha}</p>

<p>📝 ${reserva.comentarios || ""}</p>

<p>Estado: ${reserva.estado || "Pendiente"}</p>


<button onclick="confirmarReserva(${reserva.id})">
Confirmar
</button>


<button class="borrar" onclick="borrarReserva(${reserva.id})">
Borrar
</button>


</div>

`;

});

}


// ======================
// ACCIONES RESERVAS
// ======================

window.confirmarReserva = async function(id){

const { error } = await supabase
.from("reservas")
.update({
estado:"Confirmada"
})
.eq("id",id);


if(error){
alert(error.message);
return;
}


alert("Reserva confirmada");

cargarReservas();

};



window.borrarReserva = async function(id){

if(!confirm("¿Borrar reserva?")) return;


const { error } = await supabase
.from("reservas")
.delete()
.eq("id",id);


if(error){
alert(error.message);
return;
}


alert("Reserva borrada");

cargarReservas();

};

// INICIAR RESERVAS
cargarReservas();
