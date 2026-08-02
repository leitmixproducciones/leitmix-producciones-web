import { supabase } from "./supabase.js";

// 1. Enviar Reserva y abrir WhatsApp
document.getElementById("formReserva")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("reservaNombre").value;
    const telefono = document.getElementById("reservaTelefono").value;
    const evento = document.getElementById("reservaEvento").value;
    const fecha = document.getElementById("reservaFecha").value;
    const comentarios = document.getElementById("reservaComentarios").value;

    const { error } = await supabase.from("reservas").insert([{
        nombre, 
        telefono, 
        evento, 
        fecha, 
        comentarios
    }]);

    if (error) {
        alert("Error al guardar reserva: " + error.message);
    } else {
        alert("¡Reserva guardada con éxito!");
        document.getElementById("formReserva").reset();
        
        const numeroWhatsApp = "5491150480339"; 
        const textoMensaje = `Hola! Nueva reserva de:\n*Nombre:* ${nombre}\n*Evento:* ${evento}\n*Fecha:* ${fecha}\n*Teléfono:* ${telefono}\n*Comentarios:* ${comentarios}`;

        window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(textoMensaje)}`, '_blank');
    }
});

// 2. Enviar Testimonio Pùblico
document.getElementById("formTestimonioPublico")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("testimonioNombre").value;
    const estrellas = parseInt(document.getElementById("testimonioEstrellas").value);
    const mensaje = document.getElementById("testimonioComentario").value;

    const { error } = await supabase.from("testimonios").insert([{
        nombre, 
        estrellas, 
        mensaje, 
        activo: false
    }]);

    if (error) {
        alert("Error al enviar comentario: " + error.message);
    } else {
        alert("¡Gracias! Tu comentario fue enviado y será publicado pronto.");
        document.getElementById("formTestimonioPublico").reset();
    }
});

// 3. Cargar Galería de Fotos, Videos y Testimonios Aprobados por separado
async function cargarPublico() {
    // Cargar Fotos completas en su sección
    const { data: fotos } = await supabase.from("fotos").select("*").order("id", { ascending: false });
    const contGaleria = document.getElementById("galeriaPublica");
    if (contGaleria) {
        if (fotos && fotos.length > 0) {
            contGaleria.innerHTML = fotos.map(f => `
                <div style="background: #1e1e1e; padding: 10px; border-radius: 8px; text-align: center;">
                    <img src="${f.url}" style="width: 100%; max-height: 300px; object-fit: contain; border-radius: 6px;" alt="Foto">
                </div>
            `).join("");
        } else {
            contGaleria.innerHTML = '<p style="color: #888; text-align: center; grid-column: 1 / -1;">No hay fotos cargadas.</p>';
        }
    }

    // Cargar Videos en su propia sección
    const { data: videos } = await supabase.from("videos").select("*").order("id", { ascending: false });
    const contVideos = document.getElementById("videosPublicos");
    if (contVideos) {
        if (videos && videos.length > 0) {
            contVideos.innerHTML = videos.map(v => `
                <div style="background: #1e1e1e; padding: 10px; border-radius: 8px; text-align: center; overflow: hidden;">
                    <video src="${v.url}" controls preload="metadata" style="width: 100%; max-height: 250px; object-fit: contain; border-radius: 6px; background: #000;"></video>
                </div>
            `).join("");
        } else {
            contVideos.innerHTML = '<p style="color: #888; text-align: center; grid-column: 1 / -1;">No hay videos cargados.</p>';
        }
    }

    // Testimonios aprobados (usando la columna 'activo' y mapeando 'mensaje')
    const { data: tests } = await supabase.from("testimonios").select("*").eq("activo", true);
    const contTest = document.getElementById("testimoniosPublicos");
    if (tests && tests.length > 0 && contTest) {
        contTest.innerHTML = tests.map(t => `
            <div style="background: #1e1e1e; padding: 15px; border-radius: 8px; border: 1px solid #333;">
                <strong style="color: #ffc107;">${t.nombre}</strong>
                <p style="color: #aaa; font-size: 0.85rem; margin: 4px 0;">${"⭐".repeat(t.estrellas)}</p>
                <p style="color: #ddd; font-size: 0.95rem;">"${t.mensaje}"</p>
            </div>
        `).join("");
    }
}

cargarPublico();
