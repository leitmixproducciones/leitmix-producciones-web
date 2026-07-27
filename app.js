import { supabase } from "./supabase.js";

// ==========================================
// 1. ENVIAR RESERVA
// ==========================================
document.getElementById("formReserva")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById("reservaNombre")?.value || "";
    const telefono = document.getElementById("reservaTelefono")?.value || "";
    const evento = document.getElementById("reservaEvento")?.value || "";
    const fecha = document.getElementById("reservaFecha")?.value || "";
    const comentarios = document.getElementById("reservaComentarios")?.value || "";

    const { error } = await supabase.from("reservas").insert([{ 
        nombre, 
        telefono, 
        tipo: evento, 
        fecha, 
        detalles: comentarios 
    }]);

    if (error) {
        alert("Hubo un error al enviar la reserva: " + error.message);
    } else {
        alert("¡Reserva enviada con éxito! Nos pondremos en contacto pronto.");
        document.getElementById("formReserva").reset();
    }
});

// ==========================================
// 2. SUBIR FOTO (PANEL ADMIN)
// ==========================================
document.getElementById("formAdminGaleria")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const titulo = document.getElementById("adminTituloFoto")?.value || "";
    const archivoInput = document.getElementById("adminArchivoFoto");
    const archivo = archivoInput?.files[0];

    if (!archivo) return alert("Seleccioná una imagen.");

    const nombreArchivo = `${Date.now()}_${archivo.name}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from("galeria")
        .upload(nombreArchivo, archivo);

    if (uploadError) {
        alert("Error al subir la imagen al almacenamiento: " + uploadError.message);
        return;
    }

    const { data: urlData } = supabase.storage.from("galeria").getPublicUrl(nombreArchivo);
    const publicUrl = urlData.publicUrl;

    const { error: dbError } = await supabase.from("galeria").insert([{ Titulo: titulo, Imagen: publicUrl }]);

    if (dbError) {
        alert("Error al guardar en la tabla: " + dbError.message);
    } else {
        alert("¡Foto subida y publicada con éxito!");
        document.getElementById("formAdminGaleria").reset();
        cargarGaleriaWeb();
    }
});

// ==========================================
// 3. GUARDAR VIDEO (PANEL ADMIN)
// ==========================================
document.getElementById("formAdminVideo")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const titulo = document.getElementById("adminTituloVideo")?.value || "";
    const urlVideo = document.getElementById("adminUrlVideo")?.value || "";

    if (!urlVideo) return alert("Por favor ingresá la URL del video.");

    const { error } = await supabase.from("videos").insert([{ Titulo: titulo, Url: urlVideo }]);

    if (error) {
        alert("Error al guardar el video: " + error.message);
    } else {
        alert("¡Video guardado con éxito!");
        document.getElementById("formAdminVideo").reset();
        cargarVideosWeb();
        cargarVideosAdmin(); // Actualiza también la lista del panel admin
    }
});

// ==========================================
// 4. CARGAR GALERÍA DE FOTOS (PÚBLICA)
// ==========================================
async function cargarGaleriaWeb() {
    const contenedor = document.getElementById("galeriaPublica");
    if (!contenedor) return;

    const { data, error } = await supabase.from("galeria").select("*");

    if (error) console.error("Error cargando galería:", error);

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

// ==========================================
// 5. CARGAR VIDEOS (PÚBLICO)
// ==========================================
async function cargarVideosWeb() {
    const contenedor = document.getElementById("videosPublicos");
    if (!contenedor) return;

    const { data, error } = await supabase.from("videos").select("*");

    if (error) console.error("Error cargando videos web:", error);

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
                contenidoVideo = `
                    <video controls preload="metadata" style="width: 100%; max-height: 200px; border-radius: 6px; margin-bottom: 10px; background: #000; object-fit: cover;">
                        <source src="${vidUrl}" type="video/mp4">
                        Tu navegador no soporta reproducción de video.
                    </video>
                `;
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

// ==========================================
// 6. CARGAR VIDEOS (PANEL ADMIN CON BOTÓN ELIMINAR)
// ==========================================
async function cargarVideosAdmin() {
    const contenedorAdmin = document.getElementById("adminListaVideos");
    if (!contenedorAdmin) return;

    const { data, error } = await supabase.from("videos").select("*").order("id", { ascending: false });

    if (error) console.error("Error cargando videos admin:", error);

    if (error || !data || data.length === 0) {
        contenedorAdmin.innerHTML = "<p style='color: #888;'>No hay videos para administrar.</p>";
        return;
    }

    contenedorAdmin.innerHTML = data.map(vid => {
        const titulo = vid.Titulo || vid.titulo || 'Sin título';
        const url = vid.Url || vid.url || '';

        return `
            <div style="display: flex; justify-content: space-between; align-items: center; background: #222; padding: 10px; margin-bottom: 8px; border-radius: 6px; border: 1px solid #333;">
                <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 70%;">
                    <strong style="color: #ffc107;">🎬 ${titulo}</strong><br>
                    <small style="color: #aaa;">${url}</small>
                </div>
                <button class="btn-eliminar-video" data-id="${vid.id}" style="background: #e63946; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                    🗑️ Eliminar
                </button>
            </div>
        `;
    }).join("");

    // Asignar eventos de eliminación a cada botón
    document.querySelectorAll(".btn-eliminar-video").forEach(boton => {
        boton.addEventListener("click", async (e) => {
            const idVideo = e.currentTarget.getAttribute("data-id");
            if (confirm("¿Estás seguro de que querés eliminar este video?")) {
                const { error: delError } = await supabase.from("videos").delete().eq("id", idVideo);
                if (delError) {
                    alert("Error al eliminar: " + delError.message);
                } else {
                    alert("Video eliminado con éxito.");
                    cargarVideosAdmin();
                    cargarVideosWeb();
                }
            }
        });
    });
}

// ==========================================
// 7. CARGAR TESTIMONIOS (PÚBLICO)
// ==========================================
async function cargarTestimoniosWeb() {
    const contenedor = document.getElementById("testimoniosPublicos");
    if (!contenedor) return;

    const { data, error } = await supabase
        .from("testimonios")
        .select("*")
        .eq("aprobado", true)
        .order("id", { ascending: false });

    if (error) console.error("Error cargando testimonios:", error);

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

// ==========================================
// EJECUCIÓN INICIAL AL CARGAR LA PÁGINA
// ==========================================
cargarGaleriaWeb();
cargarVideosWeb();
cargarVideosAdmin();
cargarTestimoniosWeb();
