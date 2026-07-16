import { supabase } from "./firebase.js";

async function cargarVideos() {

  const contenedor = document.getElementById("videos-dinamicos");

  if (!contenedor) return;

  contenedor.innerHTML = "";

  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false });


  if(error){
    console.log(error);
    return;
  }


  data.forEach((video) => {

    const elemento = document.createElement("video");

    elemento.controls = true;
    elemento.width = 800;

    elemento.innerHTML = `
      <source src="${video.url}" type="video/mp4">
      Tu navegador no soporta este video.
    `;

    contenedor.appendChild(elemento);

  });

}

cargarVideos();
