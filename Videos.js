import { supabase } from "./supabase.js";

async function probarVideos() {
  const contenedor = document.getElementById("videos-dinamicos");

  // Alerta en pantalla si no encuentra el contenedor
  if (!contenedor) {
    alert("¡ATENCIÓN! No existe ningún elemento con id='videos-dinamicos' en el HTML.");
    return;
  }

  contenedor.innerHTML = "<p style='color:yellow; font-weight:bold;'>Conectando con Supabase para traer videos...</p>";

  try {
    const { data, error } = await supabase.from("videos").select("*");

    if (error) {
      contenedor.innerHTML = `<p style="color:red; font-size:18px;">Error de Supabase: ${error.message}</p>`;
      return;
    }

    if (!data || data.length === 0) {
      contenedor.innerHTML = "<p style='color:orange; font-size:18px;'>Supabase respondió OK, pero la tabla 'videos' está vacía.</p>";
      return;
    }

    contenedor.innerHTML = `<p style='color:lime;'>¡Éxito! Se encontraron ${data.length} video(s):</p>`;

    data.forEach((item) => {
      const videoUrl = item.url || item.Url;

      if (!videoUrl) {
        contenedor.innerHTML += "<p style='color:red;'>Un video no tiene URL válida.</p>";
        return;
      }

      const video = document.createElement("video");
      video.src = videoUrl;
      video.controls = true;
      video.style.width = "100%";
      video.style.maxWidth = "500px";
      video.style.margin = "10px 0";
      video.style.display = "block";
      video.style.borderRadius = "8px";

      contenedor.appendChild(video);
    });

  } catch (err) {
    contenedor.innerHTML = `<p style="color:red; font-size:18px;">Error inesperado: ${err.message}</p>`;
  }
}

// Ejecución al cargar
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", probarVideos);
} else {
  probarVideos();
}
