import { supabase } from "./supabase.js";
import { CONFIG } from "./config.js";

let urlLogoPublica = "";

// Cargar la URL del logo
async function obtenerUrlLogo() {
    try {
        const { data, error } = await supabase
            .from("configuracion")
            .select("logo, logo_url")
            .limit(1)
            .single();

        if (error || !data) return;

        urlLogoPublica = data.logo_url || data.logo || "";
        
        if (urlLogoPublica) {
            const imgLogin = document.getElementById("logoLogin");
            const imgHeader = document.getElementById("logoHeader");

            if (imgLogin) { imgLogin.src = urlLogoPublica; imgLogin.style.display = "block"; }
            if (imgHeader) { imgHeader.src = urlLogoPublica; imgHeader.style.display = "block"; }
        }
    } catch (err) {
        console.log("Error al obtener el logo:", err);
    }
}

// ==========================================
// CONTROL DE SESIÓN DEL PANEL
// ==========================================
const loginSection = document.getElementById("loginSection");
const adminSection = document.getElementById("adminSection");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const btnLogout = document.getElementById("btnLogout");
const totalReservasEl = document.getElementById("totalReservas");

function checkSession() {
    const sesionGuardada = localStorage.getItem("leitmix_admin");
    if (!loginSection || !adminSection) return;

    if (sesionGuardada === "activo") {
        mostrarPanel();
    } else {
        mostrarLogin();
    }
}

loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const emailInput = document.getElementById("email")?.value.trim() || "";
    const passwordInput = document.getElementById("password")?.value.trim() || "";
    
    if (!emailInput || !passwordInput) {
        if (loginError) loginError.textContent = "Completá todos los campos.";
        return;
    }

    // Guardamos la sesión y abrimos el panel de inmediato
    localStorage.setItem("leitmix_admin", "activo");
    mostrarPanel();
});

btnLogout?.addEventListener("click", () => {
    localStorage.removeItem("leitmix_admin");
    mostrarLogin();
});

function mostrarPanel() {
    if (loginSection) loginSection.classList.add("hidden");
    if (adminSection) adminSection.classList.remove("hidden");
    cargarDatosAdmin();
    cargarReservasEnSelect();
    cargarRecibosAdmin();
    cargarFotos();
    cargarVideosAdmin();
    cargarTestimoniosAdmin();
}

function mostrarLogin() {
    if (adminSection) adminSection.classList.add("hidden");
    if (loginSection) loginSection.classList.remove("hidden");
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
// GESTIÓN DE RECIBOS DE PAGO
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

    const { data: recibos, error } = await supabase.from("recibos").select("*");

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
// GESTIÓN DE FOTOS
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
                <button onclick="window.borrarFoto(${img.id})" style="background: #dc3545; color: white; border: none; margin-top:2px; font-size:10px; padding:4px 6px; width:100%; border-radius:4px; cursor:pointer;">Borrar</button>
            </div>`;
    }).join("");
}

window.borrarFoto = async (id) => {
    if (confirm("¿Borrar esta imagen?")) {
        const { error } = await supabase.from("galeria").delete().eq("id", id);
        if (error) alert("Error al borrar: " + error.message);
        else cargarFotos();
    }
};

// ==========================================
// GESTIÓN DE VIDEOS
// ==========================================
document.getElementById("formAdminVideo")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const tituloInput = document.getElementById("adminTituloVideo");
    const urlInput = document.getElementById("adminUrlVideo");

    let urlVideo = urlInput?.value?.trim() || "";
    const titulo = tituloInput?.value || "Video";

    if (!urlVideo) return alert("Ingresá una URL de video.");

    try {
        const { error: dbError } = await supabase.from("videos").insert([{ Titulo: titulo, Url: urlVideo }]);
        if (dbError) throw dbError;

        alert("¡Video guardado con éxito!");
        if (tituloInput) tituloInput.value = "";
        if (urlInput) urlInput.value = "";
        cargarVideosAdmin();
    } catch (err) {
        alert("Error al guardar video: " + err.message);
    }
});

async function cargarVideosAdmin() {
    const contenedorAdmin = document.getElementById("adminListaVideos");
    if (!contenedorAdmin) return;

    const { data, error } = await supabase.from("videos").select("*").order("id", { ascending: false });

    if (error || !data || data.length === 0) {
        contenedorAdmin.innerHTML = "<p style='color: #888; text-align:center;'>No hay videos.</p>";
        return;
    }

    contenedorAdmin.innerHTML = data.map(vid => `
        <div style="background:#2a2a2a; padding:8px; border-radius:6px; display:flex; justify-content:space-between; align-items:center; border: 1px solid #444; margin-bottom:6px;">
            <span style="font-size:0.9rem; color:#fff;">🎬 ${vid.Titulo}</span>
            <button onclick="window.borrarVideo(${vid.id})" style="background: #dc3545; color: white; border: none; font-size:0.8rem; padding:4px 8px; border-radius:4px; cursor:pointer;">Borrar</button>
        </div>
    `).join("");
}

window.borrarVideo = async (id) => {
    if (confirm("¿Borrar este video?")) {
        const { error } = await supabase.from("videos").delete().eq("id", id);
        if (error) alert("Error: " + error.message);
        else cargarVideosAdmin();
    }
};

// ==========================================
// GESTIÓN DE TESTIMONIOS
// ==========================================
async function cargarTestimoniosAdmin() {
    const contenedor = document.getElementById("listaTestimoniosAdmin");
    if (!contenedor) return;

    const { data, error } = await supabase.from("testimonios").select("*").order("id", { ascending: false });

    if (error || !data || data.length === 0) {
        contenedor.innerHTML = '<p style="color: #888; text-align: center; font-size: 0.9rem;">No hay testimonios.</p>';
        return;
    }

    contenedor.innerHTML = data.map(t => {
        const estrellas = "⭐".repeat(t.estrellas || 5);
        return `
            <div style="background: #2a2a2a; padding: 12px; border-radius: 6px; border: 1px solid #444; display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: #ffc107;">${t.nombre}</strong>
                    <span style="font-size: 0.85rem; color: #aaa;">${estrellas}</span>
                </div>
                <p style="color: #ddd; font-size: 0.95rem;">"${t.comentario}"</p>
                <div style="display: flex; gap: 8px; margin-top: 5px;">
                    <button onclick="window.cambiarEstadoTestimonio('${t.id}', ${!t.aprobado})" style="background: ${t.aprobado ? '#ffc107' : '#28a745'}; color: #121212; border: none; padding: 6px 10px; border-radius: 4px; font-weight: bold; cursor: pointer; flex: 1; font-size: 0.85rem;">
                        ${t.aprobado ? 'Ocultar' : 'Aprobar'}
                    </button>
                    <button onclick="window.borrarTestimonio('${t.id}')" style="background: #dc3545; color: white; border: none; padding: 6px 10px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 0.85rem;">
                        Borrar
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

window.cambiarEstadoTestimonio = async function(id, nuevoEstado) {
    const { error } = await supabase.from("testimonios").update({ aprobado: nuevoEstado }).eq("id", id);
    if (!error) cargarTestimoniosAdmin();
};

window.borrarTestimonio = async function(id) {
    if (confirm("¿Borrar testimonio?")) {
        const { error } = await supabase.from("testimonios").delete().eq("id", id);
        if (!error) cargarTestimoniosAdmin();
    }
};

// ==========================================
// INICIALIZACIÓN
// ==========================================
obtenerUrlLogo();
checkSession();
