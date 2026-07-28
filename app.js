import { supabase } from "./supabase.js";
import { CONFIG } from "./config.js";

let urlLogoPublica = "";

// Cargar la URL del logo automáticamente desde Supabase Storage
async function obtenerUrlLogo() {
    try {
        const nombresPosibles = ["Leitmix-logo.png", "leitmix-logo.png", "Leitmix-logo.jpg", "logo.png", "Logo.png"];
        let publicUrlFinal = "";

        for (let nombreArchivo of nombresPosibles) {
            const { data } = supabase.storage.from("Media").getPublicUrl(nombreArchivo);
            if (data && data.publicUrl) {
                publicUrlFinal = data.publicUrl;
                break;
            }
        }

        if (publicUrlFinal) {
            urlLogoPublica = publicUrlFinal;
            
            const imgWeb = document.getElementById("logoWeb");
            const imgLogin = document.getElementById("logoLogin");
            const imgHeader = document.getElementById("logoHeader");

            if (imgWeb) { imgWeb.src = urlLogoPublica; imgWeb.style.display = "block"; }
            if (imgLogin) { imgLogin.src = urlLogoPublica; imgLogin.style.display = "block"; }
            if (imgHeader) { imgHeader.src = urlLogoPublica; imgHeader.style.display = "block"; }
        }
    } catch (err) {
        console.log("No se pudo obtener el logo de Supabase:", err);
    }
}

// ==========================================
// 1. CONTROL DE SESIÓN (TABLA PERFILES)
// ==========================================
const loginSection = document.getElementById("loginSection");
const adminSection = document.getElementById("adminSection");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const btnLogout = document.getElementById("btnLogout");
const totalReservasEl = document.getElementById("totalReservas");

let usuario = null;

function checkSession() {
    if (!loginSection || !adminSection) return;

    const sesionGuardada = localStorage.getItem("leitmix_admin");
    if (sesionGuardada) {
        usuario = JSON.parse(sesionGuardada);
        mostrarPanel();
    } else {
        mostrarLogin();
    }
}

loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (loginError) loginError.textContent = "";
    
    const emailInput = document.getElementById("email").value.trim();
    const passwordInput = document.getElementById("password").value.trim();

    const { data, error } = await supabase
        .from("perfiles")
        .select("*")
        .eq("email", emailInput)
        .single();

    if (error || !data) {
        if (loginError) loginError.textContent = "Usuario no encontrado.";
        return;
    }

    if (data.password === passwordInput || data.contrasena === passwordInput) {
        usuario = data;
        localStorage.setItem("leitmix_admin", JSON.stringify(data));
        mostrarPanel();
    } else {
        if (loginError) loginError.textContent = "Contraseña incorrecta.";
    }
});

btnLogout?.addEventListener("click", () => {
    localStorage.removeItem("leitmix_admin");
    usuario = null;
    mostrarLogin();
});

function mostrarPanel() {
    loginSection?.classList.add("hidden");
    adminSection?.classList.remove("hidden");
    cargarDatosAdmin();
    cargarReservasEnSelect();
    cargarRecibosAdmin();
    cargarFotos();
    cargarVideosAdmin();
}

function mostrarLogin() {
    adminSection?.classList.add("hidden");
    loginSection?.classList.remove("hidden");
}

async function cargarDatosAdmin() {
    try {
        const { count, error } = await supabase
            .from('reservas')
            .select('*', { count: 'exact', head: true });

        if (!error && totalReservasEl) {
            totalReservasEl.textContent = count || 0;
        }
    } catch (err) {
        console.log("Error al cargar datos:", err);
    }
}

// ==========================================
// 2. ENVIAR RESERVA + CONFIGURACIÓN WHATSAPP
// ==========================================
document.getElementById("formReserva")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById("reservaNombre")?.value || "";
    const telefono = document.getElementById("reservaTelefono")?.value || "";
    const evento = document.getElementById("reservaEvento")?.value || "";
    const fecha = document.getElementById("reservaFecha")?.value || "";
    const comentarios = document.getElementById("reservaComentarios")?.value || "Sin comentarios";

    const { error } = await supabase.from("reservas").insert([{ 
        nombre, telefono, evento, fecha, comentarios
    }]);

    if (error) {
        alert("Hubo un error al registrar la reserva: " + error.message);
        return;
    }

    const textoMensaje = `¡Hola! Quiero confirmar mi reserva:\n\n` +
        `👤 *Nombre:* ${nombre}\n` +
        `📞 *Teléfono:* ${telefono}\n` +
        `🎉 *Evento:* ${evento}\n` +
        `📅 *Fecha:* ${fecha}\n` +
        `💬 *Comentarios:* ${comentarios}`;

    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${CONFIG.telefonoWhatsApp}&text=${encodeURIComponent(textoMensaje)}`;

    document.getElementById("formReserva").reset();

    if (confirm("¡Reserva registrada con éxito! ¿Querés abrir WhatsApp ahora para enviar los datos?")) {
        window.location.href = urlWhatsApp;
    }
});

// ==========================================
// 3. GESTIÓN DE RECIBOS DE PAGO
// ==========================================
async function cargarReservasEnSelect() {
    const select = document.getElementById("reciboReservaId");
    if (!select) return;

    const { data: reservas } = await supabase
        .from("reservas")
        .select("id, nombre, evento, fecha")
        .order("fecha", { ascending: false });

    if (!reservas) return;

    select.innerHTML = '<option value="">-- Seleccionar Reserva a Vincular (Opcional) --</option>' + 
        reservas.map(r => `<option value="${r.id}">${r.nombre} - ${r.evento || 'Evento'} (${r.fecha})</option>`).join("");
}

document.getElementById("reciboReservaId")?.addEventListener("change", async (e) => {
    const reservaId = e.target.value;
    if (!reservaId) return;

    const { data } = await supabase.from("reservas").select("*").eq("id", reservaId).single();
    if (data) {
        if(document.getElementById("reciboNombre")) document.getElementById("reciboNombre").value = data.nombre || "";
        if(document.getElementById("reciboEvento")) document.getElementById("reciboEvento").value = data.evento || "";
    }
});

document.getElementById("formRecibo")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById("reciboNombre")?.value || "";
    const evento = document.getElementById("reciboEvento")?.value || "";
    const total = parseFloat(document.getElementById("reciboTotal")?.value) || 0;
    const sena = parseFloat(document.getElementById("reciboSena")?.value) || 0;
    const concepto = document.getElementById("reciboConcepto")?.value || "Seña de evento";
    const numRecibo = "REC-" + Math.floor(10000 + Math.random() * 90000);

    const { error } = await supabase.from("recibos").insert([{
        numero_recibo: numRecibo, nombre, evento, total, sena, concepto
    }]);

    if (error) {
        alert("Error al guardar recibo: " + error.message);
    } else {
        alert("¡Recibo generado con éxito!");
        document.getElementById("formRecibo").reset();
        cargarRecibosAdmin();
    }
});

async function cargarRecibosAdmin() {
    const cont = document.getElementById("listaRecibosAdmin");
    if (!cont) return;

    const { data: recibos, error } = await supabase
        .from("recibos")
        .select("*");

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

window.borrarRecibo = async (id) => {
    if (confirm("¿Estás seguro de que querés borrar este recibo?")) {
        const { error } = await supabase.from("recibos").delete().eq("id", id);
        if (error) alert("Error al eliminar: " + error.message);
        else cargarRecibosAdmin();
    }
};

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
                .logo-img { max-width: 120px; max-height: 80px; height: auto; margin-bottom: 8px; object-fit: contain; }
                .logo { font-size: 1.2rem; font-weight: bold; color: #121212; margin-bottom: 2px; }
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
                ${urlLogoPublica ? `<img src="${urlLogoPublica}" alt="Leitmix" class="logo-img">` : ''}
                <div class="logo">${CONFIG.nombreEmpresa}</div>
                <div class="sub">${CONFIG.slogan}</div>
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
// 4. GALERÍA DE FOTOS (PÚBLICA Y ADMIN)
// ==========================================
document.getElementById("formAdminGaleria")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const tituloInput = document.getElementById("adminTituloFoto");
    const archivoInput = document.getElementById("adminArchivoFoto");
    const btnSubir = document.getElementById("btnSubirFoto");
    
    const archivo = archivoInput?.files[0];
    if (!archivo) return alert("Seleccioná una imagen.");

    const titulo = tituloInput?.value || "Sin título";
    if (btnSubir) { btnSubir.disabled = true; btnSubir.innerText = "Subiendo foto..."; }

    try {
        const path = `galeria/${Date.now()}_${archivo.name}`;
        const { error: uploadError } = await supabase.storage.from("Media").upload(path, archivo);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("Media").getPublicUrl(path);
        await supabase.from("galeria").insert([{ Imagen: urlData.publicUrl, Titulo: titulo }]);

        alert("¡Foto subida con éxito!");
        if (tituloInput) tituloInput.value = "";
        archivoInput.value = "";
        cargarFotos();
        cargarGaleriaWeb();
    } catch (err) {
        alert("Error al subir foto: " + err.message);
    } finally {
        if (btnSubir) { btnSubir.disabled = false; btnSubir.innerText = "Subir Foto a la Galería"; }
    }
});

async function cargarFotos() {
    const cont = document.getElementById("listaFotos");
    if (!cont) return;

    let { data } = await supabase.from("galeria").select("*");

    if (!data || data.length === 0) {
        cont.innerHTML = "<p style='font-size:12px; color:#aaa; grid-column: 1/-1; text-align:center;'>No hay fotos subidas.</p>";
        return;
    }

    cont.innerHTML = data.map(img => {
        const imgUrl = img.Imagen || img.url || '';
        const imgTitulo = img.Titulo || 'Sin título';

        return `
            <div style="background:#2a2a2a; padding:6px; border-radius:6px; text-align:center; border: 1px solid #444;">
                <img src="${imgUrl}" style="width:100%; height:80px; object-fit:cover; border-radius:4px;" alt="Foto">
                <p style="font-size:11px; margin:4px 0; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${imgTitulo}</p>
                <button onclick="window.borrarFoto(${img.id})" class="btn-danger" style="margin-top:2px; font-size:10px; padding:4px 6px; width:100%;">Borrar</button>
            </div>`;
    }).join("");
}

window.borrarFoto = async (id) => {
    if (confirm("¿Borrar esta imagen?")) {
        const { error } = await supabase.from("galeria").delete().eq("id", id);
        if (error) alert("Error al borrar: " + error.message);
        else {
            cargarFotos();
            cargarGaleriaWeb();
        }
    }
};

async function cargarGaleriaWeb() {
    const contenedor = document.getElementById("galeriaPublica");
    if (!contenedor) return;

    const { data, error } = await supabase.from("galeria").select("*");
    if (error || !data || data.length === 0) {
        contenedor.innerHTML = "<p style='color: #888; text-align: center; grid-column: 1 / -1;'>No hay fotos disponibles.</p>";
        return;
    }

    contenedor.innerHTML = data.map(item => {
        const titulo = item.Titulo || 'Evento';
        const imgUrl = item.Imagen || item.url || '';
        
        return `
            <div class="media-card">
                ${imgUrl ? `<img src="${imgUrl}" alt="${titulo}">` : ''}
                <p style="font-weight: 600; font-size: 0.95rem; color: #ffc107;">${titulo}</p>
            </div>
        `;
    }).join("");
}

// ==========================================
// 5. GESTIÓN Y CARGA DE VIDEOS + SINCRONIZACIÓN
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

// Botón para sincronizar videos automáticamente desde el Storage
document.getElementById("btnSincronizarVideos")?.addEventListener("click", async () => {
    const btn = document.getElementById("btnSincronizarVideos");
    if (btn) { btn.disabled = true; btn.innerText = "Sincronizando..."; }

    try {
        const { data: archivos, error: listError } = await supabase.storage
            .from("Media")
            .list("videos", { limit: 100, sortBy: { column: 'name', order: 'asc' } });

        if (listError) throw listError;

        if (!archivos || archivos.length === 0) {
            alert("No se encontraron archivos en la carpeta 'videos' del Storage.");
            return;
        }

        const { data: videosActuales } = await supabase.from("videos").select("Url");
        const urlsExistentes = new Set(videosActuales ? videosActuales.map(v => v.Url) : []);

        let agregadosCount = 0;

        for (let archivo of archivos) {
            if (!archivo.name || archivo.name === ".emptyFolderPlaceholder") continue;

            const pathCompleto = `videos/${archivo.name}`;
            const { data: urlData } = supabase.storage.from("Media").getPublicUrl(pathCompleto);
            const publicUrl = urlData.publicUrl;

            if (!urlsExistentes.has(publicUrl)) {
                let tituloLimpio = archivo.name
                    .replace(/\.[^/.]+$/, "")
                    .replace(/[-_]/g, " ");

                const { error: insertError } = await supabase.from("videos").insert([{
                    Titulo: tituloLimpio,
                    Url: publicUrl
                }]);

                if (!insertError) {
                    agregadosCount++;
                }
            }
        }

        alert(`¡Sincronización completada! Se añadieron ${agregadosCount} videos nuevos.`);
        cargarVideosAdmin();
        cargarVideosWeb();

    } catch (err) {
        alert("Error al sincronizar: " + err.message);
    } finally {
        if (btn) { btn.disabled = false; btn.innerText = "🔄 Sincronizar Videos de Storage"; }
    }
});

async function cargarVideosAdmin() {
    const contenedorAdmin = document.getElementById("adminListaVideos");
    if (!contenedorAdmin) return;

    const { data, error } = await supabase.from("videos").select("*").order("id", { ascending: false });

    if (error || !data || data.length === 0) {
        contenedorAdmin.innerHTML = "<p style='color: #888; text-align:center;'>No hay videos para administrar.</p>";
        return;
    }

    contenedorAdmin.innerHTML = data.map(vid => {
        const titulo = vid.Titulo || 'Sin título';
        const url = vid.Url || '';

        return `
            <div style="display: flex; justify-content: space-between; align-items: center; background: #222; padding: 10px; margin-bottom: 8px; border-radius: 6px; border: 1px solid #333;">
                <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 70%;">
                    <strong style="color: #ffc107;">🎬 ${titulo}</strong><br>
                    <small style="color: #aaa;">${url}</small>
                </div>
                <button onclick="window.borrarVideo(${vid.id})" style="background: #e63946; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                    🗑️ Eliminar
                </button>
            </div>
        `;
    }).join("");
}

window.borrarVideo = async (id) => {
    if (confirm("¿Estás seguro de que querés eliminar este video?")) {
        const { error } = await supabase.from("videos").delete().eq("id", id);
        if (error) alert("Error al eliminar: " + error.message);
        else {
            cargarVideosAdmin();
            cargarVideosWeb();
        }
    }
};

async function cargarVideosWeb() {
    const contenedor = document.getElementById("videosPublicos");
    if (!contenedor) return;

    const { data, error } = await supabase.from("videos").select("*");
    if (error || !data || data.length === 0) {
        contenedor.innerHTML = "<p style='color: #888; text-align: center; grid-column: 1 / -1;'>No hay videos disponibles.</p>";
        return;
    }

    contenedor.innerHTML = data.map(item => {
        const titulo = item.Titulo || 'Video';
        let vidUrl = item.Url || '';

        vidUrl = vidUrl.trim();
        if (vidUrl && !vidUrl.includes('youtube.com') && !vidUrl.includes('youtu.be')) {
            vidUrl = encodeURI(decodeURI(vidUrl));
        }

        let contenidoVideo = '<p style="color: #aaa; font-size: 0.85rem;">Próximamente disponible</p>';
        if (vidUrl) {
            if (vidUrl.includes('youtube.com') || vidUrl.includes('youtu.be')) {
                let ytId = vidUrl.includes('youtu.be') ? vidUrl.split('/').pop().split('?')[0] : new URLSearchParams(new URL(vidUrl).search).get('v');
                contenidoVideo = `<iframe width="100%" height="180" src="https://www.youtube.com/embed/${ytId}" frameborder="0" allowfullscreen style="border-radius:6px; margin-bottom:10px;"></iframe>`;
            } else {
                contenidoVideo = `
                    <video controls preload="metadata" style="width: 100%; max-height: 200px; border-radius: 6px; margin-bottom: 10px; background: #000; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <source src="${vidUrl}" type="video/mp4">
                        Tu navegador no soporta reproducción de video.
                    </video>
                    <p style="color: #ff5252; font-size: 0.8rem; display: none; text-align: center;">No se pudo cargar este archivo de video.</p>
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
// 6. TESTIMONIOS (PÚBLICO)
// ==========================================
async function cargarTestimoniosWeb() {
    const contenedor = document.getElementById("testimoniosPublicos");
    if (!contenedor) return;

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

// ==========================================
// INICIALIZACIÓN GLOBAL
// ==========================================
obtenerUrlLogo();
checkSession();
cargarGaleriaWeb();
cargarVideosWeb();
cargarTestimoniosWeb();
