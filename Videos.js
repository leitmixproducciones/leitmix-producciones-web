import { supabase, DJ_USER_ID } from "./supabase.js";

async function cargarVideos() {
  const contenedor = document.getElementById("videos-dinamicos");
  if (!contenedor) return;

  if (!DJ_USER_ID || DJ_USER_ID === "TU_ID_DE_SUPABASE_AQUI") {
    contenedor.innerHTML = "<p style='color:orange;'>Falta configurar el DJ_USER_ID en supabase.js</p>";
    return;
  }

  contenedor.innerHTML = "";

  // 1. Pedimos a Supabase SOLO los videos que pertenecen a este DJ
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("user_id", DJ_USER_ID);

  if (error) {
    contenedor.innerHTML = "<p style='color:red;'>Error al cargar videos: " + error.message + "</p>";
    console.log(error);
    return;
  }

  if (!data || data.length === 0) {
    contenedor.innerHTML = "<p style='color:#ccc;'>No hay videos cargados para este DJ.</p>";
    return;
  }

  // 2. Recorremos los videos devueltos y los mostramos
  data.forEach((item) => {
    // Detectamos la URL sin importar si en Supabase se llama "url" o "Url"
    const videoUrl = item.url || item.Url;

    if (!videoUrl) return;

    const video = document.createElement("video");
    const source = document.createElement("source");

    source.src = videoUrl;
    source.type = "video/mp4";

    video.appendChild(source);
    video.controls = true;
    video.preload = "metadata";
    video.style.width = "100%";
    video.style.maxWidth = "500px";
    video.style.margin = "10px";
    video.style.borderRadius = "8px";

    video.onerror = function () {
      console.log("Error cargando video:", videoUrl);
    };

    contenedor.appendChild(video);
  });
}

document.addEventListener("DOMContentLoaded", cargarVideos);
