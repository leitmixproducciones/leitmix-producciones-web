import { supabase } from "./supabase.js";

// LEITMIX PRODUCCIONES - SCRIPT PRINCIPAL PÚBLICO

// 1. OBTENER EL USER_ID DEL DJ DESDE LA URL (?dj=UUID)
const urlParams = new URLSearchParams(window.location.search);
let djUserId = urlParams.get("dj");

// Función para obtener el user_id del DJ activo
async function obtenerDjUserId() {
  if (djUserId) return djUserId;

  // Si no viene en la URL, busca el primero en configuración como respaldo
  const { data, error } = await supabase
    .from("configuracion")
    .select("user_id")
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    console.error("No se pudo identificar al DJ activo:", error);
    return null;
  }

  djUserId = data.user_id;
  return djUserId;
}

// 2. INICIALIZAR Y BLOQUEAR FECHAS OCUPADAS EN EL CALENDARIO (FILTRADO POR DJ)
async function inicializarCalendario() {
  try {
    const idDJ = await obtenerDjUserId();
    if (!idDJ) return;

    // Consultar las reservas registradas de este DJ que NO estén canceladas
    const { data: reservas, error } = await supabase
      .from("reservas")
      .select("fecha")
      .eq("user_id", idDJ)
      .neq("estado", "Cancelado");

    if (error) {
      console.error("Error al obtener fechas ocupadas:", error);
    }

    const fechasOcupadas = reservas ? reservas.map(r => r.fecha) : [];

    if (typeof flatpickr !== "undefined") {
      flatpickr("#fecha", {
        locale: "es",
        minDate: "today",
        dateFormat: "Y-m-d",
        disable: fechasOcupadas,
        disableMobile: true
      });
    }
  } catch (err) {
    console.error("Error inicializando el calendario:", err);
  }
}

// 3. WHATSAPP Y RESERVA DE PRESUPUESTO
async function enviarWhatsApp() {
  const nombre = document.getElementById("nombre").value;
  const telefono = document.getElementById("telefono").value;
  const evento = document.getElementById("evento").value;
  let fecha = document.getElementById("fecha").value;

  if (!fecha) {
    alert("Elegí una fecha para el evento");
    return;
  }

  const invitados = document.getElementById("invitados").value;
  const invitadosNumero = invitados === "" ? null : Number(invitados);
  const localidad = document.getElementById("localidad").value;
  const comentarios = document.getElementById("comentarios").value;

  const playlistInfaltables = document.getElementById("playlist-infaltables") ? document.getElementById("playlist-infaltables").value : "";
  const playlistProhibidos = document.getElementById("playlist-prohibidos") ? document.getElementById("playlist-prohibidos").value : "";
  const notasEvento = document.getElementById("notas-evento") ? document.getElementById("notas-evento").value : "";

  const idDJ = await obtenerDjUserId();

  if (!idDJ) {
    alert("Error: No se pudo identificar al DJ correspondiente.");
    return;
  }

  // GUARDAR RESERVA EN SUPABASE CON EL USER_ID DEL DJ
  const { data, error } = await supabase
    .from("reservas")
    .insert([
      {
        nombre: nombre,
        telefono: telefono,
        evento: evento,
        fecha: fecha,
        invitados: invitadosNumero,
        localidad: localidad,
        comentarios: comentarios,
        estado: "Pendiente",
        user_id: idDJ,
        playlist_infaltables: playlistInfaltables,
        playlist_prohibidos: playlistProhibidos,
        notas_evento: notasEvento
      }
    ])
    .select();

  if (error) {
    alert("Error al guardar en Supabase: " + error.message);
    return;
  }

  alert("Reserva guardada correctamente");

  // CONSTRUIR MENSAJE DE WHATSAPP
  const mensaje =
`Hola Leitmix Producciones, quiero solicitar un presupuesto.

Nombre: ${nombre}
Teléfono: ${telefono}
Evento: ${evento}
Fecha: ${fecha}
Invitados: ${invitados || "No informado"}
Localidad: ${localidad}

Comentarios:
${comentarios || "Sin comentarios"}

🔥 Temas Infaltables:
${playlistInfaltables || "No especificó"}

🚫 Temas Prohibidos:
${playlistProhibidos || "No especificó"}

📝 Notas para el DJ:
${notasEvento || "Sin notas adicionales"}`;

  const url = "https://wa.me/5491150480339?text=" + encodeURIComponent(mensaje);
  window.location.href = url;
}

// 4. GUARDAR TESTIMONIO CON EL USER_ID DEL DJ AUTOMÁTICO
async function guardarTestimonio(e) {
  if (e) e.preventDefault();

  const idDJ = await obtenerDjUserId();

  if (!idDJ) {
    alert("Error: No se pudo identificar al DJ para asociar este testimonio.");
    return;
  }

  const nombre = document.getElementById("testimonioNombre") ? document.getElementById("testimonioNombre").value : "";
  const evento = document.getElementById("testimonioEvento") ? document.getElementById("testimonioEvento").value : "";
  const comentario = document.getElementById("testimonioComentario") ? document.getElementById("testimonioComentario").value : "";

  if (!nombre || !comentario) {
    alert("Por favor completá tu nombre y el comentario.");
    return;
  }

  const { error } = await supabase
    .from("testimonios")
    .insert([
      {
        user_id: idDJ, // 👈 Se asigna automáticamente el user_id del DJ
        nombre: nombre,
        evento: evento,
        comentario: comentario,
        aprobado: false // Pendiente de revisión en el panel del DJ
      }
    ]);

  if (error) {
    alert("Error al enviar el testimonio: " + error.message);
    return;
  }

  alert("¡Gracias por tu testimonio! El DJ lo revisará antes de publicarlo.");

  const form = document.getElementById("formTestimonio");
  if (form) form.reset();
}

// 5. INICIALIZACIÓN AL CARGAR LA PÁGINA
document.addEventListener("DOMContentLoaded", function () {
  inicializarCalendario();

  const boton = document.getElementById("boton-whatsapp");
  if (boton) {
    boton.addEventListener("click", enviarWhatsApp);
  }

  const formTestimonio = document.getElementById("formTestimonio");
  if (formTestimonio) {
    formTestimonio.addEventListener("submit", guardarTestimonio);
  }
});
// ==========================================
// 6. CARGAR VIDEOS DINÁMICOS (FILTRADO POR DJ)
// ==========================================
async function cargarVideosPublicos() {
  const contenedor = document.getElementById("videos-dinamicos");
  if (!contenedor) return;

  contenedor.innerHTML = "<p style='color:yellow; text-align:center;'>Cargando videos...</p>";

  try {
    const idDJ = await obtenerDjUserId();

    if (!idDJ) {
      contenedor.innerHTML = "<p style='color:orange; text-align:center;'>No se pudo identificar al DJ para cargar sus videos.</p>";
      return;
    }

    // Buscamos los videos en Supabase filtrados por el user_id del DJ activo
    const { data: videos, error } = await supabase
      .from("videos")
      .select("*")
      .eq("user_id", idDJ);

    if (error) {
      contenedor.innerHTML = `<p style="color:red; text-align:center;">Error al cargar videos: ${error.message}</p>`;
      return;
    }

    if (!videos || videos.length === 0) {
      contenedor.innerHTML = "<p style='color:#ccc; text-align:center;'>Aún no hay videos subidos para este DJ.</p>";
      return;
    }

    contenedor.innerHTML = "";

    videos.forEach((item) => {
      // Capturamos la URL del video (en minúscula o mayúscula)
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
    contenedor.innerHTML = `<p style="color:red; text-align:center;">Error interno: ${err.message}</p>`;
  }
}

// Agregar el llamado a la función cuando se cargue el DOM
document.addEventListener("DOMContentLoaded", function () {
  cargarVideosPublicos();
});
