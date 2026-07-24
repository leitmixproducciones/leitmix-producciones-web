import { supabase, DJ_USER_ID } from "./supabase.js";

async function cargarTestimoniosPublicos() {
  const contenedor = document.getElementById("testimonios-dinamicos");
  if (!contenedor) return;

  if (!DJ_USER_ID) {
    console.error("No se definió el DJ_USER_ID en supabase.js");
    return;
  }

  // Traemos ÚNICAMENTE los testimonios aprobados de ESTE DJ en particular
  const { data: testimonios, error } = await supabase
    .from("testimonios")
    .select("*")
    .eq("user_id", DJ_USER_ID)
    .eq("aprobado", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener testimonios:", error);
    return;
  }

  contenedor.innerHTML = "";

  if (!testimonios || testimonios.length === 0) {
    contenedor.innerHTML = "<p style='color:#ccc;'>Aún no hay opiniones cargadas.</p>";
    return;
  }

  testimonios.forEach((t) => {
    const numEstrellas = t.estrellas ? Number(t.estrellas) : 5;
    const estrellas = "⭐".repeat(numEstrellas);

    contenedor.innerHTML += `
      <div class="card-testimonio" style="margin-bottom:15px; padding:15px; border:1px solid #444; border-radius:8px; text-align:left;">
        <h4>${t.nombre} <span style="font-size:12px; color:#f5b400;">(${t.evento || "Evento"})</span></h4>
        <p>${estrellas}</p>
        <p>"${t.comentario}"</p>
      </div>
    `;
  });
}

// Guardar nuevo testimonio enviado por un cliente
async function enviarTestimonio() {
  if (!DJ_USER_ID) {
    alert("Error de configuración: No se encontró el ID del DJ.");
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

  const { error } = await supabase.from("testimonios").insert([
    {
      user_id: DJ_USER_ID,
      nombre: nombre,
      evento: evento,
      estrellas: estrellas,
      comentario: comentario,
      aprobado: false // Queda en espera hasta que el DJ lo apruebe en su panel
    }
  ]);

  if (error) {
    alert("Error al enviar el comentario: " + error.message);
    return;
  }

  alert("¡Gracias por tu comentario! Será publicado una vez que el DJ lo apruebe.");

  const form = document.getElementById("formulario-testimonio");
  if (form) form.reset();
}

document.addEventListener("DOMContentLoaded", () => {
  cargarTestimoniosPublicos();

  const botonEnviar = document.getElementById("enviar-testimonio");
  if (botonEnviar) {
    botonEnviar.addEventListener("click", enviarTestimonio);
  }
});
