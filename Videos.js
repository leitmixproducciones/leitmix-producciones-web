const SUPABASE_URL = 'https://fevvtbbyzxvnanzeedzp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_l8Hb4ydFb7uGcjODFG8sBg_jY-jEFrF';

async function cargarVideosDirecto() {
  const contenedor = document.getElementById("videos-dinamicos");
  if (!contenedor) return;

  contenedor.innerHTML = "<p style='color:yellow; text-align:center;'>Cargando videos...</p>";

  try {
    const respuesta = await fetch(`${SUPABASE_URL}/rest/v1/videos?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!respuesta.ok) {
      contenedor.innerHTML = `<p style="color:red; text-align:center;">Error de servidor: ${respuesta.status}</p>`;
      return;
    }

    const data = await respuesta.json();

    if (!data || data.length === 0) {
      contenedor.innerHTML = "<p style='color:#ccc; text-align:center;'>La tabla de videos está vacía en Supabase.</p>";
      return;
    }

    contenedor.innerHTML = "";

    data.forEach((item) => {
      // Busca la URL se llame 'url' o 'Url'
      const videoUrl = item.url || item.Url;
      if (!videoUrl) return;

      const video = document.createElement("video");
      video.src = videoUrl;
      video.controls = true;
      video.preload = "metadata";
      video.style.width = "100%";
      video.style.maxWidth = "500px";
      video.style.margin = "15px auto";
      video.style.display = "block";
      video.style.borderRadius = "8px";

      contenedor.appendChild(video);
    });

  } catch (err) {
    contenedor.innerHTML = `<p style="color:red; text-align:center;">Error de conexión: ${err.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", cargarVideosDirecto);
cargarVideosDirecto();
