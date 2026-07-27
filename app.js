import { supabase } from "./supabase.js";

// ==========================================
// 1. ENVIAR RESERVA + BOTÓN CONFIRMACIÓN A WHATSAPP
// ==========================================
document.getElementById("formReserva")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById("reservaNombre")?.value || "";
    const telefono = document.getElementById("reservaTelefono")?.value || "";
    const evento = document.getElementById("reservaEvento")?.value || "";
    const fecha = document.getElementById("reservaFecha")?.value || "";
    const comentarios = document.getElementById("reservaComentarios")?.value || "Sin comentarios";

    // 1. Guardar en Supabase
    const { error } = await supabase.from("reservas").insert([{ 
        nombre: nombre, 
        telefono: telefono, 
        evento: evento, 
        fecha: fecha,
        comentarios: comentarios
    }]);

    if (error) {
        alert("Hubo un error al registrar la reserva: " + error.message);
        return;
    }

    // 2. Armar link de WhatsApp
    const telefonoDuenio = "5491150480339"; 
    const textoMensaje = `¡Hola! Quiero confirmar mi reserva:\n\n` +
        `👤 *Nombre:* ${nombre}\n` +
        `📞 *Teléfono:* ${telefono}\n` +
        `🎉 *Evento:* ${evento}\n` +
        `📅 *Fecha:* ${fecha}\n` +
        `💬 *Comentarios:* ${comentarios}`;

    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${telefonoDuenio}&text=${encodeURIComponent(textoMensaje)}`;

    // 3. Limpiar formulario
    document.getElementById("formReserva").reset();

    // 4. Preguntar si desea finalizar la reserva por WhatsApp
    const abrirWhatsApp = confirm("¡Reserva registrada con éxito! ¿Querés abrir WhatsApp ahora para enviar los datos?");
    if (abrirWhatsApp) {
        window.location.href = urlWhatsApp;
    }
});

// ==========================================
// 2. GESTIÓN DE RECIBOS DE PAGO (PANEL ADMIN)
// ==========================================

// Cargar las reservas en el selector desplegable para autocompletar
async function cargarReservasEnSelect() {
    const select = document.getElementById("reciboReservaId");
    if (!select) return;

    const { data: reservas } = await supabase
        .from("reservas")
        .select("id, nombre, evento, fecha")
        .order("fecha", { ascending: false });

    if (!reservas) return;

    select.innerHTML = '<option value="">-- Seleccionar Reserva Vincular (Opcional) --</option>' + 
        reservas.map(r => `<option value="${r.id}">${r.nombre} - ${r.evento || 'Evento'} (${r.fecha})</option>`).join("");
}

// Autocompletar nombre y evento al seleccionar una reserva
document.getElementById("reciboReservaId")?.addEventListener("change", async (e) => {
    const reservaId = e.target.value;
    if (!reservaId) return;

    const { data } = await supabase.from("reservas").select("*").eq("id", reservaId).single();
    if (data) {
        if(document.getElementById("reciboNombre")) document.getElementById("reciboNombre").value = data.nombre || "";
        if(document.getElementById("reciboEvento")) document.getElementById("reciboEvento").value = data.evento || "";
    }
});

// Evento para emitir y guardar el recibo en la base de datos
document.getElementById("formRecibo")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById("reciboNombre")?.value || "";
    const evento = document.getElementById("reciboEvento")?.value || "";
    const total = parseFloat(document.getElementById("reciboTotal")?.value) || 0;
    const sena = parseFloat(document.getElementById("reciboSena")?.value) || 0;
    const concepto = document.getElementById("reciboConcepto")?.value || "Seña de evento";
    const numRecibo = "REC-" + Math.floor(10000 + Math.random() * 90000);

    const { error } = await supabase.from("recibos").insert([{
        numero_recibo: numRecibo,
        nombre: nombre,
        evento: evento,
        total: total,
        sena: sena,
        concepto: concepto
    }]);

    if (error) {
        alert("Error al guardar recibo: " + error.message);
    } else {
        alert("¡Recibo generado con éxito!");
        document.getElementById("formRecibo").reset();
        cargarRecibosAdmin();
    }
});

// Cargar lista de recibos en el Panel de Administración
async function cargarRecibosAdmin() {
    const cont = document.getElementById("listaRecibosAdmin") || document.getElementById("recibosEmitidos");
    if (!cont) return;

    const { data: recibos, error } = await supabase
        .from("recibos")
        .select("*")
        .order("created_at", { ascending: false });

    if (error || !recibos || recibos.length === 0) {
        cont.innerHTML = "<p style='color:#888; font-size:0.9rem; text-align:center;'>No hay recibos generados.</p>";
        return;
    }

    cont.innerHTML = recibos.map(r => {
        const total = parseFloat(r.total || 0);
        const sena = parseFloat(r.sena || 0);
        const restante = total - sena;
        const numRecibo = r.numero_recibo || `REC-${r.id}`;

        return `
            <div style="background: #222; padding: 12px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #333;">
                <strong style="color: #ffc107; font-size: 1rem;">🧾 ${numRecibo} - ${r.nombre}</strong>
                <p style="margin: 5px 0; color: #ccc; font-size: 0.85rem;">
                    Total: $${total} | Abonado: $${sena} | <b style="color: #ff5252;">Pendiente: $${restante}</b>
                </p>
                <div style="margin-top: 8px; display: flex; gap: 8px;">
                    <button onclick="window.generarImagenRecibo('${r.nombre}', '${r.evento || 'Evento'}', '${numRecibo}', ${total}, ${sena}, '${r.concepto || 'Seña'}')" 
                            style="background: #ffc107; color: #121212; border: none; padding: 6px 10px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size:0.8rem;">
                        👁️ Ver Recibo
                    </button>
                    <button onclick="window.borrarRecibo('${r.id}')" 
                            style="background: #dc3545; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size:0.8rem;">
                        Borrar
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

// Función global para borrar recibos
window.borrarRecibo = async (id) => {
    if (confirm("¿Estás seguro de que querés borrar este recibo?")) {
        const { error } = await supabase.from("recibos").delete().eq("id", id);
        if (error) alert("Error al eliminar: " + error.message);
        else cargarRecibosAdmin();
    }
};

// Función global para generar y visualizar/imprimir el comprobante
window.generarImagenRecibo = function(nombre, evento, numeroRecibo, total, sena, concepto) {
    const restante = total - sena;
    const fechaHoy = new Date().toLocaleDateString('es-AR');

    const contenidoHTML = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Recibo ${numeroRecibo}</title>
            <style>
                body { font-family: Arial, sans-serif; background: #121212; color: #333; padding: 20px; display: flex; justify-content: center; }
                .recibo-card { background: #fff; width: 340px; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); border-top: 8px solid #ffc107; text-align: center; }
                .logo { font-size: 1.3rem; font-weight: bold; color: #121212; margin-bottom: 2px; }
                .sub { font-size: 0.8rem; color: #666; margin-bottom: 15px; }
                .numero { font-size: 0.9rem; font-weight: bold; background: #eee; padding: 6px 12px; border-radius: 4px; display: inline-block; margin-bottom: 15px; }
                .detalles { text-align: left; font-size: 0.9rem; border-top: 1px dashed #ccc; border-bottom: 1px dashed #ccc; padding: 12px 0; margin-bottom: 15px; line-height: 1.6; }
                .monto-box { background: #fff8e1; border: 1px solid #ffe082; padding: 10px; border-radius: 6px; font-weight: bold; font-size: 1.1rem; color: #856404; margin-bottom: 15px; }
                .btn-imprimir { background: #28a745; color: #fff; border: none; padding: 10px 18px; font-weight: bold; border-radius: 5px; cursor: pointer; margin-top: 10px; font-size: 0.9rem; }
                @media print { .btn-imprimir { display: none; } body { background: white; padding: 0; } }
            </style>
        </head>
        <body>
            <div class="recibo-card">
                <div class="logo">🎵 LEITMIX PRODUCCIONES</div>
                <div class="sub">Sonido, Iluminación y DJs</div>
                <div class="numero">COMPROBANTE: ${numeroRecibo}</div>
                
                <div class="detalles">
                    <b>Fecha:</b> ${fechaHoy}<br>
                    <b>Cliente:</b> ${nombre}<br>
                    <b>Evento:</b> ${evento}<br>
                    <b>Concepto:</b> ${concepto}
                </div>

                <div class="monto-box">
                    Abonado / Seña: $${sena}
                </div>

                <div class="detalles" style="border: none; padding: 0; margin-bottom: 10px;">
                    <b>Precio Total:</b> $${total}<br>
                    <b style="color: ${restante > 0 ? '#d9534f' : '#28a745'};">Saldo Pendiente: $${restante}</b>
                </div>

                <button class="btn-imprimir" onclick="window.print()">🖨️ Guardar PDF / Imprimir</button>
            </div>
        </body>
        </html>
    `;

    const ventana = window.open('', '_blank');
    ventana.document.write(contenidoHTML);
    ventana.document.close();
};

// ==========================================
// 3. SUBIR FOTO (PANEL ADMIN)
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
// 4. GUARDAR VIDEO (PANEL ADMIN)
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
        cargarVideosAdmin();
    }
});

// ==========================================
// 5. CARGAR GALERÍA DE FOTOS (PÚBLICA)
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
// 6. CARGAR VIDEOS (PÚBLICO)
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
// 7. CARGAR VIDEOS (PANEL ADMIN CON BOTÓN ELIMINAR)
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
// 8. CARGAR TESTIMONIOS (PÚBLICO)
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
cargarReservasEnSelect();
cargarRecibosAdmin();
