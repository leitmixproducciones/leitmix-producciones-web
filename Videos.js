import { supabase } from "./supabase.js";

async function cargarVideos() {
  const contenedor = document.getElementById("videos-dinamicos");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  try {
    const { data, error } = await supabase.from("videos").select("*");

    if (error) {
      contenedor.innerHTML = `<p style="color:red;">Error de Supabase: ${error.message}</p>`;
      return;
    }

    if (!data || data.length === 0) {
      contenedor.innerHTML = "<p style='color:#ccc;'>No hay videos cargados en la base de datos.</p>";
      return;
    }

    data.forEach((item) => {
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
      video.style.margin = "10px auto";
      video.style.display = "block";
      video.style.borderRadius = "8px";

      contenedor.appendChild(video);
    });

  } catch (err) {
    contenedor.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
  }
}

// Ejecutamos la función inmediatamente al cargar
cargarVideos();
