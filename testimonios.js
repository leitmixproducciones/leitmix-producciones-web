import { supabase } from "./supabase.js";

async function cargarTestimoniosPublicos() {
  const contenedor = document.getElementById("testimonios-dinamicos");
  if (!contenedor) return;

  contenedor.innerHTML = "<p style='color:#f5b400;'>Cargando testimonios...</p>";

  // Traemos TODOS los testimonios que tengan aprobado = true para descartar fallos de ID
  const { data: testimonios, error } = await supabase
    .from("testimonios")
    .select("*")
    .eq("aprobado", true);

  if (error) {
    alert("Error de Supabase: " + error.message);
    contenedor.innerHTML = "<p style='color:red;'>Error al cargar testimonios.</p>";
    return;
  }

  if (!testimonios || testimonios.length === 0) {
    contenedor.innerHTML = "<p style='color:orange;'>Supabase no devolvió ningún testimonio con aprobado = true.</p>";
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
}

// Inicializar al cargar
document.addEventListener("DOMContentLoaded", () => {
  cargarTestimoniosPublicos();
});
