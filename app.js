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

// 2. Subir Foto desde el Panel de Administración
document.getElementById("formAdminGaleria").addEventListener("submit", async (e) => {
    e.preventDefault();
    const titulo = document.getElementById("adminTituloFoto").value;
    const archivoInput = document.getElementById("adminArchivoFoto");
    const archivo = archivoInput.files[0];

    if (!archivo) return alert("Seleccioná una imagen.");

    const nombreArchivo = `${Date.now()}_${archivo.name}`;

    // Sube el archivo al Storage de Supabase (asegurate de tener un bucket llamado 'galeria' o ajusta el nombre)
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from("galeria")
        .upload(nombreArchivo, archivo);

    if (uploadError) {
        alert("Error al subir la imagen al almacenamiento: " + uploadError.message);
        return;
    }

    // Obtiene la URL pública del archivo subido
    const { data: urlData } = supabase.storage.from("galeria").getPublicUrl(nombreArchivo);
    const publicUrl = urlData.publicUrl;

    // Guarda el registro en la tabla 'galeria'
    const { error: dbError } = await supabase.from("galeria").insert([{ Titulo: titulo, Imagen: publicUrl }]);

    if (dbError) {
        alert("Error al guardar en la tabla: " + dbError.message);
    } else {
        alert("¡Foto subida y publicada con éxito!");
        document.getElementById("formAdminGaleria").reset();
        cargarGaleriaWeb();
    }
});

// 3. Guardar Video desde el Panel de Administración
document.getElementById("formAdminVideo").addEventListener("submit", async (e) => {
    e.preventDefault();
    const titulo = document.getElementById("adminTituloVideo").value;
    const urlVideo = document.getElementById("adminUrlVideo").value;

    const { error } = await supabase.from("videos").insert([{ Titulo: titulo, Url: urlVideo }]);

    if (error) {
        alert("Error al guardar el video: " + error.message);
    } else {
        alert("¡Video guardado con éxito!");
        document.getElementById("formAdminVideo").reset();
        cargarVideosWeb();
    }
});

// 4. Cargar Galería de Fotos
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

// 5. Cargar Videos
async function cargarVideosWeb() {
    const contenedor = document.getElementById("videosPublicos");
    const { data, error } = await supabase.from("videos").select("*");

    if (error || !data || data.length === 0) {
        contenedor.innerHTML = "<p style='color: #888; text-align: center; grid-column: 1 / -1;'>No hay videos disponibles.</p>";
        return;
    }

    contenedor.innerHTML = data.map(item => {
        const titulo = item.Titulo || item.titulo || item.nombre || 'Video Leitmix';
        const vidUrl = item.Url || item.url || item.Video || item.video || item.link || '';

        let contenidoVideo = '<p style="color: #aaa; font-size: 0.85rem;">Próximamente disponible</p>';
        if (vidUrl) {
            if (vidUrl.includes('youtube.com') || vidUrl.includes('youtu.be')) {
                let ytId = vidUrl.includes('youtu.be') ? vidUrl.split('/').pop().split('?')[0] : new URLSearchParams(new URL(vidUrl).search).get('v');
                contenidoVideo = `<iframe width="100%" height="180" src="https://www.youtube.com/embed/${ytId}" frameborder="0" allowfullscreen style="border-radius:6px; margin-bottom:10px;"></iframe>`;
            } else {
                contenidoVideo = `<video src="${vidUrl}" controls style="width: 100%; height: 180px; border-radius: 6px; margin-bottom: 10px; background: #000;"></video>`;
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

// 6. Cargar Testimonios Aprobados
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
