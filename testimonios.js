import { supabase } from "./supabase.js";

async function cargarTestimoniosPublicos() {
  const contenedor = document.getElementById("testimonios-dinamicos");
  if (!contenedor) return;

  contenedor.innerHTML = "<p style='color:#f5b400; font-weight:bold;'>Cargando testimonios desde Supabase...</p>";

  try {
    const { data: testimonios, error } = await supabase
      .from("testimonios")
      .select("*")
      .eq("aprobado", true);

    if (error) {
      alert("Error de Supabase: " + error.message);
      contenedor.innerHTML = `<p style='color:red;'>Error: ${error.message}</p>`;
      return;
    }

    if (!testimonios || testimonios.length === 0) {
      contenedor.innerHTML = "<p style='color:orange;'>Supabase no tiene testimonios con aprobado = true.</p>";
      return;
    }

    contenedor.innerHTML = "";
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

  } catch (err) {
    alert("Error de Javascript: " + err.message);
  }
}

// Guardar un nuevo testimonio desde la web
async function enviarTestimonio() {
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
      nombre: nombre,
      evento: evento,
      estrellas: estrellas,
      comentario: comentario,
      aprobado: false
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
