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


const {error}=await supabase.storage
.from("Media")
.upload("imagenes/" + nombreArchivo, archivo);


if(error){
alert(error.message);
return;
}


const {data}=supabase.storage
.from("Media")
.getPublicUrl("imagenes/" + nombreArchivo);



const {error:errorDB}=await supabase
.from("galeria")
.insert([{

Imagen:data.publicUrl,

Titulo:tituloImagen.value

}]);


if(errorDB){
alert(errorDB.message);
return;
}


alert("Imagen subida correctamente");


archivoImagen.value="";
tituloImagen.value="";


cargarImagenes();

};

}



// ======================
// SUBIR VIDEO
// ======================


const archivoVideo=document.getElementById("videoArchivo");
const tituloVideo=document.getElementById("videoTitulo");
const botonVideo=document.getElementById("guardarVideo");


if(botonVideo){

botonVideo.onclick=async()=>{


const archivo=archivoVideo.files[0];


if(!archivo){
alert("Elegí un video");
return;
}


const nombreArchivo=Date.now()+"-"+archivo.name;


const {error}=await supabase.storage
.from("Media")
.upload("videos/"+nombreArchivo,archivo);


if(error){
alert(error.message);
return;
}


const {data}=supabase.storage
.from("Media")
.getPublicUrl("videos/"+nombreArchivo);



const {error:errorDB}=await supabase
.from("videos")
.insert([{

Titulo:tituloVideo.value,

Url:data.publicUrl

}]);


if(errorDB){
alert(errorDB.message);
return;
}


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

const lista=document.getElementById("listaImagenes");


if(!lista)return;



const {data,error}=await supabase
.from("galeria")
.select("*")
.order("id",{ascending:false});


if(error){
console.log(error);
return;
}


lista.innerHTML="";


data.forEach(imagen=>{


lista.innerHTML+=`

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



window.borrarImagen=async function(id){


if(!confirm("¿Borrar imagen?"))return;



const {error}=await supabase
.from("galeria")
.delete()
.eq("id",id);



if(error){

alert(error.message);
return;

}


cargarImagenes();


};
// ======================
// VIDEOS
// ======================


async function cargarVideos(){

const lista=document.getElementById("listaVideos");


if(!lista)return;


const {data,error}=await supabase
.from("videos")
.select("*")
.order("id",{ascending:false});


if(error){

console.log(error);
return;

}


lista.innerHTML="";


data.forEach(video=>{


lista.innerHTML+=`

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



window.borrarVideo=async function(id){


if(!confirm("¿Borrar video?"))return;



const {error}=await supabase
.from("videos")
.delete()
.eq("id",id);



if(error){

alert(error.message);
return;

}


cargarVideos();


};




// ======================
// TESTIMONIOS
// ======================


async function cargarTestimonios(){


const lista=document.getElementById("listaTestimonios");


if(!lista)return;



const {data,error}=await supabase
.from("testimonios")
.select("*")
.order("id",{ascending:false});



if(error){

console.log(error);
return;

}



lista.innerHTML="";



data.forEach(testimonio=>{


lista.innerHTML+=`

<div class="item">


<h3>${testimonio.nombre}</h3>


<p>${testimonio.evento || ""}</p>


<p>${testimonio.comentario}</p>


</div>

`;

});

}


// ======================
// RESERVAS
// ======================

async function cargarReservas(){


const lista=document.getElementById("listaReservas");


if(!lista)return;



const {data,error}=await supabase
.from("reservas")
.select("*")
.order("id",{ascending:false});



if(error){

console.log(error);
return;

}



lista.innerHTML="";



data.forEach(reserva=>{


lista.innerHTML+=`

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



<button onclick="emitirRecibo(${reserva.id})">

🧾 Emitir recibo

</button>



<button class="borrar" onclick="borrarReserva(${reserva.id})">

Borrar

</button>



</div>

`;

});


}





window.confirmarReserva=async function(id){


const {error}=await supabase
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






window.borrarReserva=async function(id){


if(!confirm("¿Borrar reserva?"))return;



const {error}=await supabase
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





// ======================
// RECIBOS
// ======================


let reservaSeleccionada=null;



window.emitirRecibo=async function(id){


const {data,error}=await supabase
.from("reservas")
.select("*")
.eq("id",id)
.single();



if(error){

alert(error.message);
return;

}



reservaSeleccionada=data;



const nombre=document.getElementById("reciboNombre");
const evento=document.getElementById("reciboEvento");
const fecha=document.getElementById("reciboFecha");



if(nombre) nombre.value=data.nombre || "";

if(evento) evento.value=data.evento || "";

if(fecha) fecha.value=data.fecha || "";



alert("Reserva cargada para recibo");


};





const botonCrearRecibo=document.getElementById("crearRecibo");



if(botonCrearRecibo){



botonCrearRecibo.onclick=async()=>{


if(!reservaSeleccionada){

alert("Primero seleccioná una reserva");

return;

}



const total=Number(
document.getElementById("reciboTotal").value
);



const importe=Number(
document.getElementById("reciboImporte").value
);



if(!total || !importe){

alert("Completá los importes");

return;

}



const saldo_pendiente=total-importe;



const numero=

"REC-"+

new Date().getFullYear()+

"-"+

String(Date.now()).slice(-6);




const {error}=await supabase
.from("recibos")
.insert([{


numero_recibo:numero,


reserva_id:reservaSeleccionada.id,


nombre:reservaSeleccionada.nombre,


telefono:reservaSeleccionada.telefono,


evento:reservaSeleccionada.evento,


fecha_evento:reservaSeleccionada.fecha,


total:total,


importe:importe,


concepto:document.getElementById("reciboConcepto").value,


forma_pago:document.getElementById("reciboFormaPago").value,


saldo_pendiente:saldo_pendiente,


observaciones:document.getElementById("reciboObservaciones").value,


fecha_pago:new Date()


}]);



if(error){

alert(error.message);

return;

}



alert("Recibo creado: "+numero);



cargarRecibos();



};



  }

// ======================
// RECIBO MANUAL
// ======================

const botonReciboManual = document.getElementById("crearReciboManual");


if(botonReciboManual){


botonReciboManual.onclick = async()=>{


const nombre = document.getElementById("manualNombre").value;

const telefono = document.getElementById("manualTelefono").value;

const evento = document.getElementById("manualEvento").value;

const fecha = document.getElementById("manualFecha").value;


const total = Number(
document.getElementById("manualTotal").value
);


const importe = Number(
document.getElementById("manualImporte").value
);


if(!nombre || !evento || !total || !importe){

alert("Completá los datos obligatorios");

return;

}


const saldo_pendiente = total - importe;


const numero =

"REC-" +

new Date().getFullYear() +

"-" +

String(Date.now()).slice(-6);



const {error}=await supabase
.from("recibos")
.insert([{

numero_recibo:numero,

reserva_id:null,

nombre:nombre,

telefono:telefono,

evento:evento,

fecha_evento:fecha,

total:total,

importe:importe,

concepto:
document.getElementById("manualConcepto").value,

forma_pago:
document.getElementById("manualFormaPago").value,

saldo_pendiente:saldo_pendiente,

observaciones:
document.getElementById("manualObservaciones").value,

fecha_pago:new Date()

}]);


if(error){

alert(error.message);

return;

}


alert("Recibo manual creado: " + numero);



document.querySelectorAll(

"#manualNombre,#manualTelefono,#manualEvento,#manualFecha,#manualTotal,#manualImporte,#manualConcepto,#manualFormaPago,#manualObservaciones"

)
.forEach(e=>e.value="");



cargarRecibos();


};


}

// ======================
// RECIBOS EMITIDOS
// ======================


async function cargarRecibos(){


const lista=document.getElementById("listaRecibos");


if(!lista)return;



const {data,error}=await supabase
.from("recibos")
.select("*")
.order("id",{ascending:false});



if(error){

console.log(error);
return;

}



lista.innerHTML="";



data.forEach(recibo=>{


lista.innerHTML+=`

<div class="item">


<h3>🧾 ${recibo.numero_recibo}</h3>


<p>👤 ${recibo.nombre}</p>


<p>🎉 ${recibo.evento}</p>


<p>💰 Total: $${Number(recibo.total || 0).toLocaleString("es-AR")}</p>


<p>💵 Recibido: $${Number(recibo.importe || 0).toLocaleString("es-AR")}</p>


<p>📌 Saldo: $${Number(recibo.saldo_pendiente || 0).toLocaleString("es-AR")}</p>


<p>📅 ${new Date(recibo.fecha_pago).toLocaleDateString("es-AR")}</p>



<p>


<a href="../recibo.html?id=${recibo.id}" target="_blank">
📄 Ver recibo

</a>

</p>



</div>

`;

});


}





// ======================
// CARGAR TODO
// ======================


cargarImagenes();

cargarVideos();

cargarTestimonios();

cargarReservas();

cargarRecibos();
