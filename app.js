import { supabase } from "./supabase.js";

// 1. Enviar Reserva
document.getElementById("formReserva").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("reservaNombre").value;
    const tipo = document.getElementById("reservaTipo").value;
    const fecha = document.getElementById("reservaFecha").value;
    const detalles = document.getElementById("reservaDetalles").value;

    const { error } = await supabase.from("reservas").insert([{ nombre, tipo, fecha, detalles }]);

    if (error) {
        alert("Hubo un error al enviar la reserva: " + error.message);
    } else {
        alert("¡Reserva enviada con éxito! Nos pondremos en contacto pronto.");
        document.getElementById("formReserva").reset();
    }
});

// 2. Cargar Galería de Fotos
async function cargarGaleriaWeb() {
    const contenedor = document.getElementById("galeriaPublica");
    const { data, error } = await supabase.from("galeria").select("*");

    if (error || !data || data.length === 0) {
        contenedor.innerHTML = "<p style='color: #888; text-align: center; grid-column: 1 / -1;'>No hay fotos disponibles.</p>";
        return;
    }

    contenedor.innerHTML = data.map(item => {
        const titulo = item.Titulo || item.titulo || item.nombre || 'Evento Leitmix';
        const imgUrl = item.Imagen || item.imagen || item.url || item.link || '';
        
        return `
            <div class="media-card">
                ${imgUrl ? `<img src="${imgUrl}" alt="${titulo}">` : '<div style="height:180px; background:#222; display:flex; align-items:center; justify-content:center; color:#777; border-radius:6px; margin-bottom:10px;">Sin imagen</div>'}
                <p style="font-weight: 600; font-size: 0.95rem; color: #ffc107;">${titulo}</p>
            </div>
        `;
    }).join("");
}

// 3. Cargar Videos
async function cargarVideosWeb() {
    const contenedor = document.getElementById("videosPublicos");
    const { data, error } = await supabase.from("videos").select("*");

    if (error || !data || data.length === 0) {
        contenedor.innerHTML = "<p style='color: #888; text-align: center; grid-column: 1 / -1;'>No hay videos disponibles.</p>";
        return;
    }

    contenedor.innerHTML = data.map(item => {
        const titulo = item.Titulo || item.titulo || item.nombre || 'Video Leitmix';
        const vidUrl = item.Video || item.video || item.url || item.link || '';

        let contenidoVideo = '<p style="color: #aaa; font-size: 0.85rem;">Próximamente disponible</p>';
        if (vidUrl) {
            if (vidUrl.includes('youtube.com') || vidUrl.includes('youtu.be')) {
                let ytId = vidUrl.includes('youtu.be') ? vidUrl.split('/').pop() : new URLSearchParams(new URL(vidUrl).search).get('v');
                contenidoVideo = `<iframe width="100%" height="180" src="https://www.youtube.com/embed/${ytId}" frameborder="0" allowfullscreen style="border-radius:6px; margin-bottom:10px;"></iframe>`;
            } else {
                contenidoVideo = `<video src="${vidUrl}" controls style="width: 100%; height: 180px; border-radius: 6px; margin-bottom: 10px;"></video>`;
            }
        }

        return `
            <div class="media-card">
                <p style="font-weight: 600; font-size: 0.95rem; color: #ffc107; margin-bottom: 8px;">🎬 ${titulo}</p>
                ${contenidoVideo}
            </div>
        `;
    }).join("");
}

// 4. Cargar Testimonios Aprobados
async function cargarTestimoniosWeb() {
    const contenedor = document.getElementById("testimoniosPublicos");
    const { data, error } = await supabase
        .from("testimonios")
        .select("*")
        .eq("aprobado", true)
        .order("id", { ascending: false });

    if (error || !data || data.length === 0) {
        contenedor.innerHTML = "<p style='color: #888; text-align: center; grid-column: 1 / -1;'>Aún no hay testimonios publicados.</p>";
        return;
    }

    contenedor.innerHTML = data.map(t => {
        const estrellas = "⭐".repeat(t.estrellas || 5);
        return `
            <div class="testimonio-card">
                <div style="font-size: 1rem; margin-bottom: 6px;">${estrellas}</div>
                <p style="font-style: italic; color: #ddd; margin-bottom: 10px; font-size: 0.9rem;">"${t.comentario}"</p>
                <h4 style="color: #ffc107; font-size: 0.9rem; font-weight: 600;">- ${t.nombre}</h4>
            </div>
        `;
    }).join("");
}

cargarGaleriaWeb();
cargarVideosWeb();
cargarTestimoniosWeb();
