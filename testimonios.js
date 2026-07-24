import { supabase, DJ_USER_ID } from "./supabase.js";

async function cargarTestimoniosPublicos() {
  const contenedor = document.getElementById("testimonios-dinamicos");
  if (!contenedor) return;

  // 1. Mensaje azul: Nos avisa que el script está funcionando y leyendo el ID
  contenedor.innerHTML = `<p style="color: #4da6ff; font-weight: bold;">Buscando testimonios para el DJ: ${DJ_USER_ID}...</p>`;

  try {
    const { data: testimonios, error } = await supabase
      .from("testimonios")
      .select("*")
      .eq("user_id", DJ_USER_ID)
      .eq("aprobado", true)
      .order("created_at", { ascending: false });

    // 2. Mensaje rojo: Si Supabase bloquea la lectura por permisos, lo leemos acá
    if (error) {
      contenedor.innerHTML = `<div style="background: #ffcccc; color: #cc0000; padding: 10px; border-radius: 5px;">
        <strong>Error de Supabase:</strong> ${error.message}
      </div>`;
      return;
    }

    // 3. Mensaje naranja: Si la conexión fue exitosa pero no encontró ninguno aprobado
    if (!testimonios || testimonios.length === 0) {
      contenedor.innerHTML = `<p style="color: #ffa500; font-weight: bold;">
        Conexión exitosa, pero Supabase dice que hay 0 testimonios aprobados para este ID.
      </p>`;
      return;
    }

    // 4. Si todo va bien, los muestra normalmente
    contenedor.innerHTML = "";
    testimonios.forEach((t) => {
      const cantidadEstrellas = t.estrellas ? Number(t.estrellas) : 5;
      const estrellas = "⭐".repeat(cantidadEstrellas);

      contenedor.innerHTML += `
        <div class="card-testimonio" style="margin-bottom:15px; padding:15px; border:1px solid #444; border-radius:8px;">
          <h4>${t.nombre} <span style="font-size:12px; color:#f5b400;">(${t.evento || "Evento"})</span></h4>
          <p>${estrellas}</p>
          <p>"${t.comentario}"</p>
        </div>
      `;
    });

  } catch (err) {
    // 5. Si hay un error de código JS, lo atrapamos
    contenedor.innerHTML = `<p style="color: red; font-weight: bold;">Error interno: ${err.message}</p>`;
  }
}

async function enviarTestimonio() {
  if (!DJ_USER_ID) {
    alert("Error: No se encontró el ID del DJ.");
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
      aprobado: false 
    }
  ]);

  if (error) {
    alert("Error al enviar: " + error.message);
    return;
  }

  alert("¡Gracias por tu comentario! El DJ lo revisará antes de publicarlo.");
  const form = document.getElementById("formulario-testimonio");
  if (form) form.reset();
}

document.addEventListener("DOMContentLoaded", () => {
  cargarTestimoniosPublicos();
  const botonEnviar = document.getElementById("enviar-testimonio");
  if (botonEnviar) botonEnviar.addEventListener("click", enviarTestimonio);
});
