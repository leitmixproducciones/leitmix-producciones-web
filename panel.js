import { supabase } from "./supabase.js";

const loginSection = document.getElementById("loginSection");
const adminSection = document.getElementById("adminSection");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const btnLogout = document.getElementById("btnLogout");
const userLoggedEmail = document.getElementById("userLoggedEmail");
const totalReservasEl = document.getElementById("totalReservas");
const totalRecibosEl = document.getElementById("totalRecibos");

async function verificarSesion() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        mostrarPanel(session.user);
    } else {
        mostrarLogin();
    }
}

loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        if (loginError) loginError.textContent = "Error: " + error.message;
    } else {
        mostrarPanel(data.user);
    }
});

window.recuperarPassword = async function() {
    const emailInput = document.getElementById("loginEmail")?.value.trim();
    if (!emailInput) {
        alert("Por favor, ingresa tu correo electrónico arriba para recuperar la contraseña.");
        return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(emailInput, {
        redirectTo: window.location.href,
    });

    if (error) {
        alert("Error al enviar recuperación: " + error.message);
    } else {
        alert("¡Correo de recuperación enviado! Revisá tu Bandeja de entrada o Spam.");
    }
};

btnLogout?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    mostrarLogin();
});

function mostrarPanel(user) {
    if (loginSection) loginSection.classList.add("hidden");
    if (adminSection) adminSection.classList.remove("hidden");
    if (userLoggedEmail) userLoggedEmail.textContent = `Conectado como: ${user.email}`;
    
    cargarReservasAdmin();
    cargarRecibosAdmin();
    cargarMediaAdmin();
    cargarTestimoniosAdmin();
}

function mostrarLogin() {
    if (adminSection) adminSection.classList.add("hidden");
    if (loginSection) loginSection.classList.remove("hidden");
    if (loginError) loginError.textContent = "";
}

// Cargar y listar Reservas
async function cargarReservasAdmin() {
    const { data: reservas, count } = await supabase
        .from('reservas')
        .select('*', { count: 'exact' })
        .order('id', { ascending: false });

    if (totalReservasEl) totalReservasEl.textContent = count || 0;

    const contenedorReservas = document.getElementById("listaReservasAdmin");
    if (!contenedorReservas) return;

    if (!reservas || reservas.length === 0) {
        contenedorReservas.innerHTML = '<p style="color: #888; text-align: center; font-size: 0.9rem;">No hay reservas registradas.</p>';
        return;
    }

    contenedorReservas.innerHTML = reservas.map(r => `
        <div style="background: #2a2a2a; padding: 12px; border-radius: 6px; border: 1px solid #444; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: #ffc107; font-size: 1rem;">${r.nombre}</strong>
                <span style="font-size: 0.8rem; color: #aaa;">📅 ${r.fecha || 'Sin fecha'}</span>
            </div>
            <p style="color: #ddd; font-size: 0.9rem; margin: 4px 0;">🎉 <b>Evento:</b> ${r.evento || 'No especificado'}</p>
            <p style="color: #ddd; font-size: 0.9rem; margin: 4px 0;">📞 <b>Teléfono:</b> ${r.telefono || 'Sin teléfono'}</p>
            ${r.comentarios ? `<p style="color: #bbb; font-size: 0.85rem; margin: 4px 0; font-style: italic;">"${r.comentarios}"</p>` : ''}
            <div style="text-align: right; margin-top: 6px;">
                <button onclick="window.eliminarReserva(${r.id})" style="background: #dc3545; color: #fff; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">Eliminar Reserva</button>
            </div>
        </div>
    `).join("");
}

window.eliminarReserva = async function(id) {
    if (confirm("¿Estás seguro de eliminar esta reserva?")) {
        const { error } = await supabase.from("reservas").delete().eq("id", id);
        if (!error) cargarReservasAdmin();
        else alert("Error al eliminar la reserva.");
    }
};

// Cargar, crear, sumar y listar Recibos con opción de Ver Recibo Formal
const reciboForm = document.getElementById("reciboForm");
reciboForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const cliente = document.getElementById("reciboCliente").value.trim();
    const monto = parseFloat(document.getElementById("reciboMonto").value);
    const detalle = document.getElementById("reciboDetalle").value.trim();

    const { error } = await supabase
        .from("recibos")
        .insert([{ cliente, monto, detalle }]);

    if (error) {
        alert("Error al crear recibo: " + error.message);
    } else {
        alert("¡Recibo creado con éxito!");
        reciboForm.reset();
        cargarRecibosAdmin();
    }
});

async function cargarRecibosAdmin() {
    const { data: recibos } = await supabase
        .from("recibos")
        .select("*")
        .order("id", { ascending: false });

    const contenedorRecibos = document.getElementById("listaRecibosAdmin");
    if (!contenedorRecibos) return;

    if (!recibos || recibos.length === 0) {
        contenedorRecibos.innerHTML = '<p style="color: #888; text-align: center; font-size: 0.9rem;">No hay recibos emitidos.</p>';
        if (totalRecibosEl) totalRecibosEl.textContent = "$0";
        return;
    }

    const sumaTotal = recibos.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0);
    if (totalRecibosEl) totalRecibosEl.textContent = `$${sumaTotal.toLocaleString('es-AR')}`;

    contenedorRecibos.innerHTML = recibos.map(rec => {
        const fechaFormateada = new Date(rec.created_at).toLocaleDateString('es-AR');
        return `
            <div style="background: #2a2a2a; padding: 10px; border-radius: 6px; border: 1px solid #444; margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="color: #ffc107; font-size: 0.95rem;">${rec.cliente}</strong> 
                    <span style="color: #28a745; font-weight: bold; font-size: 1rem;">$${Number(rec.monto).toLocaleString('es-AR')}</span>
                </div>
                <p style="color: #bbb; font-size: 0.85rem; margin: 2px 0;">📝 ${rec.detalle || 'Sin detalle'} (${fechaFormateada})</p>
                <div style="display: flex; gap: 6px; margin-top: 8px;">
                    <button onclick="window.verRecibo('${rec.cliente.replace(/'/g, "\\'")}', ${rec.monto}, '${(rec.detalle || '').replace(/'/g, "\\'")}', '${fechaFormateada}', ${rec.id})" style="background: #ffc107; color: #121212; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.75rem; font-weight: bold; flex: 1;">Ver Recibo / Enviar</button>
                    <button onclick="window.eliminarRecibo(${rec.id})" style="background: #dc3545; color: #fff; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">Borrar</button>
                </div>
            </div>
        `;
    }).join("");
}

// Ventana Emergente con el Recibo Profesional y Botón de WhatsApp
window.verRecibo = function(cliente, monto, detalle, fecha, id) {
    const ventanaRecibo = window.open('', '_blank', 'width=500,height=650');
    ventanaRecibo.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Recibo Oficial #${id} - Leitmix Producciones</title>
            <style>
                body { background: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .receipt { background: #ffffff; width: 100%; max-width: 420px; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-top: 6px solid #ffc107; color: #333; }
                .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 15px; margin-bottom: 15px; }
                .header h2 { margin: 5px 0 0 0; color: #121212; font-size: 1.4rem; }
                .header p { color: #666; font-size: 0.85rem; margin: 2px 0; }
                .info-group { margin-bottom: 12px; font-size: 0.95rem; }
                .info-group span { font-weight: bold; color: #444; }
                .monto-box { background: #fff9e6; border: 1px dashed #ffc107; padding: 12px; text-align: center; border-radius: 8px; margin: 20px 0; }
                .monto-box h3 { color: #d48806; margin: 0; font-size: 1.6rem; }
                .footer { text-align: center; font-size: 0.75rem; color: #888; border-top: 1px solid #eee; padding-top: 15px; margin-top: 20px; }
                .btn-whatsapp { background: #25d366; color: white; border: none; padding: 12px; width: 100%; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1rem; margin-top: 10px; text-align: center; display: block; text-decoration: none; }
                .btn-whatsapp:hover { background: #1ebe5d; }
                .btn-print { background: #333; color: white; border: none; padding: 10px; width: 100%; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.9rem; margin-top: 8px; }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="header">
                    <h2>LEITMIX PRODUCCIONES</h2>
                    <p>Comprobante de Pago / Recibo Oficial</p>
                    <p>Fecha: <b>${fecha}</b> | Recibo N°: <b>#000${id}</b></p>
                </div>
                <div class="info-group">
                    <p><span>Cliente:</span> ${cliente}</p>
                </div>
                <div class="info-group">
                    <p><span>Concepto / Detalle:</span> ${detalle}</p>
                </div>
                <div class="monto-box">
                    <p style="margin: 0 0 5px 0; font-size: 0.85rem; color: #666;">Monto Recibido</p>
                    <h3>$${Number(monto).toLocaleString('es-AR')}</h3>
                </div>
                <a href="https://api.whatsapp.com/send?text=Hola%20*${encodeURIComponent(cliente)}*,%20te%20env%C3%ADo%20el%20comprobante%20de%20pago%20de%20Leitmix%20Producciones.%0A%0A*Recibo%20N%C2%B0:*%20%23000${id}%0A*Fecha:*%20${fecha}%0A*Concepto:*%20${encodeURIComponent(detalle)}%0A*Monto:*%20%24${Number(monto).toLocaleString('es-AR')}%0A%0A%C2%A1Muchas%20gracias%20por%20confiar%20en%20nosotros!" target="_blank" class="btn-whatsapp">
                    📲 Enviar Comprobante por WhatsApp
                </a>
                <button onclick="window.print()" class="btn-print">🖨️ Imprimir / Guardar PDF</button>
                <div class="footer">
                    <p>Leitmix Producciones - Panel Multiusuario Profesional</p>
                </div>
            </div>
        </body>
        </html>
    `);
};

window.eliminarRecibo = async function(id) {
    if (confirm("¿Estás seguro de eliminar este recibo?")) {
        const { error } = await supabase.from("recibos").delete().eq("id", id);
        if (!error) cargarRecibosAdmin();
        else alert("Error al eliminar el recibo.");
    }
};

// Subida de Multimedia
const mediaForm = document.getElementById("mediaForm");
mediaForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById("mediaFile");
    const file = fileInput.files[0];
    if (!file) return;

    const esVideo = file.type.startsWith('video');
    const tablaDestino = esVideo ? 'videos' : 'fotos';
    
    const CLOUD_NAME = "exzcoeyi";
    const UPLOAD_PRESET = "leitmix_preset";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
        const submitBtn = mediaForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Error al subir a Cloudinary");

        const { error: dbError } = await supabase.from(tablaDestino).insert([{ url: data.secure_url }]);

        if (dbError) {
            alert(`Error al guardar en la tabla ${tablaDestino}: ` + dbError.message);
        } else {
            alert(`¡${esVideo ? 'Video' : 'Foto'} subido con éxito!`);
            fileInput.value = "";
            cargarMediaAdmin();
        }
    } catch (err) {
        alert("Error en la subida: " + err.message);
    } finally {
        const submitBtn = mediaForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = false;
    }
});

async function cargarMediaAdmin() {
    const contenedor = document.getElementById("listaMediaAdmin");
    if (!contenedor) return;

    const { data: fotos } = await supabase.from("fotos").select("*").order("id", { ascending: false });
    const { data: videos } = await supabase.from("videos").select("*").order("id", { ascending: false });

    const totalItems = [
        ...(fotos || []).map(f => ({ ...f, tipo: 'foto' })),
        ...(videos || []).map(v => ({ ...v, tipo: 'video' }))
    ].sort((a, b) => b.id - a.id);

    if (totalItems.length === 0) {
        contenedor.innerHTML = '<p style="color: #888; text-align: center;">No hay archivos subidos.</p>';
        return;
    }

    contenedor.innerHTML = totalItems.map(m => `
        <div style="background: #2a2a2a; padding: 8px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #444; gap: 10px; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                ${m.tipo === 'foto' ? `<img src="${m.url}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 4px;" alt="Miniatura">` : `<video src="${m.url}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 4px; background: #000;"></video>`}
                <a href="${m.url}" target="_blank" style="color: #ffc107; text-decoration: none; font-size: 0.85rem;">Ver ${m.tipo}</a>
            </div>
            <button onclick="window.eliminarMedia(${m.id}, '${m.tipo}')" style="background: #dc3545; color: #fff; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Eliminar</button>
        </div>
    `).join("");
}

window.eliminarMedia = async function(id, tipo) {
    if (confirm("¿Estás seguro de borrar este archivo?")) {
        const tabla = tipo === 'video' ? 'videos' : 'fotos';
        const { error } = await supabase.from(tabla).delete().eq("id", id);
        if (!error) cargarMediaAdmin();
        else alert("Error al eliminar.");
    }
};

// Moderación de Testimonios
async function cargarTestimoniosAdmin() {
    const contenedor = document.getElementById("listaTestimoniosAdmin");
    if (!contenedor) return;

    const { data: tests } = await supabase.from("testimonios").select("*").order("id", { ascending: false });

    if (!tests || tests.length === 0) {
        contenedor.innerHTML = '<p style="color: #888; text-align: center; font-size: 0.9rem;">No hay testimonios para moderar.</p>';
        return;
    }

    contenedor.innerHTML = tests.map(t => `
        <div style="background: #2a2a2a; padding: 12px; border-radius: 6px; border: 1px solid #444; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between;">
                <strong style="color: #ffc107;">${t.nombre}</strong>
                <span style="font-size: 0.85rem; color: #aaa;">${"⭐".repeat(t.estrellas)}</span>
            </div>
            <p style="color: #ddd; font-size: 0.95rem; margin: 6px 0;">"${t.mensaje || ''}"</p>
            <div style="display: flex; gap: 8px; margin-top: 8px;">
                <button onclick="window.cambiarEstado(${t.id}, ${!t.activo})" style="background: ${t.activo ? '#ffc107' : '#28a745'}; color: #121212; border: none; padding: 6px; border-radius: 4px; font-weight: bold; cursor: pointer; flex: 1; font-size: 0.85rem;">
                    ${t.activo ? 'Ocultar' : 'Aprobar'}
                </button>
            </div>
        </div>
    `).join("");
}

window.cambiarEstado = async function(id, nuevoEstado) {
    const { error } = await supabase.from("testimonios").update({ activo: nuevoEstado }).eq("id", id);
    if (!error) {
        cargarTestimoniosAdmin();
    } else {
        alert("Error real: " + error.message);
    }
};

verificarSesion();
