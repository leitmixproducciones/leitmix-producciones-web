import { supabase } from "./supabase.js";

// 1. OBTENER EL USER_ID DEL DJ DESDE LA URL (?dj=UUID)
const urlParams = new URLSearchParams(window.location.search);
let djUserId = urlParams.get("dj");

// Función para identificar qué DJ está activo en la página
async function obtenerDjUserId() {
  if (djUserId) return djUserId;

  // Si no viene en la URL, busca la primera configuración como respaldo
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

// 2. MOSTRAR TESTIMONIOS PUBLICADOS (APROBADOS) DEL DJ EN LA PÁGINA
async function cargarTestimoniosPublicos() {
  const contenedor = document.getElementById("testimonios-dinamicos");
  if (!contenedor) return;

  const idDJ = await obtenerDjUserId();
  if (!idDJ) return;

  const { data: testimonios, error } = await supabase
    .from("testimonios")
    .select("*")
    .eq("user_id", idDJ)      // Solo los de este DJ
    .eq("aprobado", true)     // Solo los aprobados por el DJ
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al cargar testimonios:", error);
    return;
  }

  contenedor.innerHTML = "";

  if (!testimonios || testimonios.length === 0) {
    contenedor.innerHTML = "<p>Aún no hay testimonios publicados.</p>";
    return;
  }

  testimonios.forEach((t) => {
    const estrellas = "⭐".repeat(t.estrellas || 5);
    contenedor.innerHTML += `
      <div class="card-testimonio" style="margin-bottom: 15px; padding: 15px; border: 1px solid #333; border-radius: 8px;">
        <h4>${t.nombre} <small>(${t.evento || "Evento"})</small></h4>
        <p>${estrellas}</p>
        <p>"${t.comentario}"</p>
      </div>
    `;
  });
}

// 3. ENVIAR NUEVO TESTIMONIO CON EL USER_ID DEL DJ
async function enviarTestimonio() {
  const idDJ = await obtenerDjUserId();

  if (!idDJ) {
    alert("Error: No se pudo identificar al DJ correspondiente.");
    return;
  }

  const nombreInput = document.getElementById("nombre-testimonio");
  const eventoInput = document.getElementById("evento-testimonio");
  const estrellasInput = document.getElementById("estrellas-testimonio");
  const comentarioInput = document.getElementById("comentario-testimonio");

  const nombre = nombreInput ? nombreInput.value.trim() : "";
  const evento = eventoInput ? eventoInput.value.trim() : "";
  const estrellas = estrellasInput ? Number(estrellasInput.value) : 5;
  const comentario = comentarioInput ? comentarioInput.value.trim() : "";

  if (!nombre || !comentario) {
    alert("Por favor completá tu nombre y el comentario.");
    return;
  }

  // GUARDAR EN SUPABASE
  const { error } = await supabase.from("testimonios").insert([
    {
      user_id: idDJ,          // 👈 ¡ASIGNA AUTOMÁTICAMENTE EL USER_ID DEL DJ!
      nombre: nombre,
      evento: evento,
      estrellas: estrellas,
      comentario: comentario,
      aprobado: false         // Arranca en pendiente para que el DJ lo apruebe desde su panel
    }
  ]);

  if (error) {
    alert("Error al enviar el comentario: " + error.message);
    return;
  }

  alert("¡Gracias por tu comentario! Será publicado una vez que el DJ lo revise.");

  // Limpiar el formulario
  const form = document.getElementById("formulario-testimonio");
  if (form) form.reset();
}

// 4. ESCUCHAR EVENTOS AL CARGAR LA PÁGINA
document.addEventListener("DOMContentLoaded", () => {
  cargarTestimoniosPublicos();

  const botonEnviar = document.getElementById("enviar-testimonio");
  if (botonEnviar) {
    botonEnviar.addEventListener("click", enviarTestimonio);
  }
});
