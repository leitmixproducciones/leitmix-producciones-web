import { supabase } from "./supabase.js";

// 1. Manejar el Inicio de Sesión
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Evita que el formulario intente loguear si se presionó otro botón interno
    if (e.submitter && (e.submitter.id === "btnRegistrar" || e.submitter.id === "btnOlvido")) {
        return;
    }

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert("Error al iniciar sesión: " + error.message);
    } else {
        verificarSesion();
    }
});

// 2. Cerrar Sesión
document.getElementById("btnLogout")?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    verificarSesion();
});

// 3. Verificar Estado de la Sesión al cargar o cambiar
async function verificarSesion() {
    const { data: { session } } = await supabase.auth.getSession();
    
    const loginSection = document.getElementById("loginSection");
    const adminSection = document.getElementById("adminSection");

    if (session) {
        if (loginSection) loginSection.style.display = "none";
        if (adminSection) adminSection.style.display = "block";
        cargarPanelAdmin(session.user.id);
    } else {
        if (loginSection) loginSection.style.display = "flex";
        if (adminSection) adminSection.style.display = "none";
    }
}

// 4. Cargar y Administrar Todos los Datos del Panel (Filtrados por Usuario)
async function cargarPanelAdmin(userId) {
    // --- A. Cargar Reservas del usuario ---
    const { data: reservas } = await supabase
        .from("reservas")
        .select("*")
        .eq("user_id", userId)
        .order("id", { ascending: false });

    const contReservas = document.getElementById("listaReservasAdmin");
    const totalReservasBadge = document.getElementById("totalReservas");
    
    if (totalReservasBadge) totalReservasBadge.textContent = reservas ? reservas.length : 0;

    if (contReservas) {
        if (reservas && reservas.length > 0) {
            contReservas.innerHTML = reservas.map(r => `
                <div style="background: var(--bg-input); padding: 12px; margin-bottom: 10px; border-radius: 10px; border: 1px solid var(--border-color);">
                    <p style="margin: 0 0 5px 0; font-weight: 600;">${r.nombre} - <span style="color: var(--accent);">${r.evento}</span></p>
                    <p style="margin: 0 0 8px 0; font-size: 0.85rem; color: var(--text-muted);">Fecha: ${r.fecha} | Tel: ${r.telefono}</p>
                    <button onclick="window.eliminarReserva(${r.id})" class="btn-danger-subtle" style="padding: 6px 12px; font-size: 0.8rem;">Eliminar</button>
                </div>
            `).join("");
        } else {
            contReservas.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No hay reservas registradas.</p>';
        }
    }

    // --- B. Cargar Recibos del usuario (Con botones de WhatsApp e Imprimir) ---
    const { data: recibos } = await supabase
        .from("recibos")
        .select("*")
        .eq("user_id", userId)
        .order("id", { ascending: false });

    const contRecibos = document.getElementById("listaRecibosAdmin");
    const totalRecibosBadge = document.getElementById("totalRecibos");

    let sumaTotal = 0;
    if (recibos && recibos.length > 0) {
        sumaTotal = recibos.reduce((acc, curr) => acc + Number(curr.monto || 0), 0);
    }
    if (totalRecibosBadge) totalRecibosBadge.textContent = `$${sumaTotal.toLocaleString()}`;

    if (contRecibos) {
        if (recibos && recibos.length > 0) {
            contRecibos.innerHTML = recibos.map(rec => {
                const fechaActual = new Date().toLocaleDateString();
                const idReciboStr = String(rec.id).padStart(4, '0');
                return `
                <div style="background: var(--bg-input); padding: 15px; border-radius: 12px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 10px;">
                    <div>
                        <p style="margin: 0 0 4px 0; font-weight: 600; font-size: 1rem;">${rec.cliente} - <span style="color: var(--success);">$${Number(rec.monto).toLocaleString()}</span></p>
                        <p style="margin: 0; font-size: 0.9rem; color: var(--text-muted);">Concepto: ${rec.detalle}</p>
                    </div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap; border-top: 1px solid var(--border-color); padding-top: 10px;">
                        <button onclick="window.enviarWhatsApp('${rec.cliente}', '${rec.monto}', '${rec.detalle}')" style="background: #25d366; color: #fff; border: none; padding: 8px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer; flex: 1; text-align: center;">💬 WhatsApp</button>
                        <button onclick="window.imprimirRecibo('${idReciboStr}', '${fechaActual}', '${rec.cliente}', '${rec.monto}', '${rec.detalle}')" style="background: var(--accent); color: #0b0f19; border: none; padding: 8px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer; flex: 1; text-align: center;">🖨️ Imprimir</button>
                        <button onclick="window.eliminarRecibo(${rec.id})" class="btn-danger-subtle" style="padding: 8px 12px; font-size: 0.8rem; text-align: center;">Borrar</button>
                    </div>
                </div>
            `;
            }).join("");
        } else {
            contRecibos.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No hay recibos creados.</p>';
        }
    }

    // --- C. Cargar Testimonios del usuario para moderar ---
    const { data: testimonios } = await supabase
        .from("testimonios")
        .select("*")
        .eq("user_id", userId)
        .order("id", { ascending: false });

    const contTestimonios = document.getElementById("listaTestimoniosAdmin");
    if (contTestimonios) {
        if (testimonios && testimonios.length > 0) {
            contTestimonios.innerHTML = testimonios.map(t => `
                <div style="background: var(--bg-input); padding: 12px; margin-bottom: 10px; border-radius: 10px; border: 1px solid var(--border-color);">
                    <p style="margin: 0 0 4px 0; font-weight: 600;">${t.nombre} <span style="font-weight: normal;">(${"⭐".repeat(t.estrellas)})</span></p>
                    <p style="margin: 0 0 8px 0; font-size: 0.9rem; color: var(--text-muted);">"${t.mensaje}"</p>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="window.toggleTestimonio(${t.id}, ${!t.activo})" class="btn-primary" style="padding: 6px 12px; font-size: 0.8rem; width: auto; background: ${t.activo ? 'var(--text-muted)' : 'var(--success)'};">${t.activo ? 'Ocultar' : 'Aprobar'}</button>
                        <button onclick="window.eliminarTestimonio(${t.id})" class="btn-danger-subtle" style="padding: 6px 12px; font-size: 0.8rem;">Eliminar</button>
                    </div>
                </div>
            `).join("");
        } else {
            contTestimonios.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No hay testimonios para moderar.</p>';
        }
    }

    // --- D. Cargar Multimedia (Fotos y Videos) del usuario ---
    const contMedia = document.getElementById("listaMediaAdmin");
    if (contMedia) {
        const { data: fotos } = await supabase.from("fotos").select("*").eq("user_id", userId).order("id", { ascending: false });
        const { data: videos } = await supabase.from("videos").select("*").eq("user_id", userId).order("id", { ascending: false });

        let mediaHTML = "";

        if (fotos && fotos.length > 0) {
            mediaHTML += `<h4 style="color: var(--text-muted); margin: 10px 0 5px 0; font-size: 0.9rem;">Fotos</h4>`;
            mediaHTML += fotos.map(f => `
                <div style="background: var(--bg-input); padding: 10px; margin-bottom: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--border-color);">
                    <img src="${f.url}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" alt="Foto">
                    <button onclick="window.eliminarMedia('fotos', ${f.id})" class="btn-danger-subtle" style="padding: 6px 10px; font-size: 0.75rem;">Borrar</button>
                </div>
            `).join("");
        }

        if (videos && videos.length > 0) {
            mediaHTML += `<h4 style="color: var(--text-muted); margin: 15px 0 5px 0; font-size: 0.9rem;">Videos</h4>`;
            mediaHTML += videos.map(v => `
                <div style="background: var(--bg-input); padding: 10px; margin-bottom: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--border-color);">
                    <video src="${v.url}" style="width: 60px; height: 50px; object-fit: cover; border-radius: 4px;" preload="metadata"></video>
                    <button onclick="window.eliminarMedia('videos', ${v.id})" class="btn-danger-subtle" style="padding: 6px 10px; font-size: 0.75rem;">Borrar</button>
                </div>
            `).join("");
        }

        if ((!fotos || fotos.length === 0) && (!videos || videos.length === 0)) {
            mediaHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No hay archivos multimedia cargados.</p>';
        }

        contMedia.innerHTML = mediaHTML;
    }
}

// 5. Funciones de Recibos (WhatsApp y Comprobante Exacto con Logo)
window.enviarWhatsApp = function(cliente, monto, detalle) {
    const mensaje = `🎧 *LEITMIX PRODUCCIONES* \n\nEstimado/a *${cliente}*, le confirmamos la recepción de su pago.\n\n💰 *Monto:* $${Number(monto).toLocaleString()}\n📝 *Concepto:* ${detalle}\n\n¡Muchas gracias por confiar en nosotros! 🚀`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
};

window.imprimirRecibo = function(idRecibo, fecha, cliente, monto, detalle) {
    const ventanaImpresion = window.open('', '_blank');
    ventanaImpresion.document.write(`
        <html>
            <head>
                <title>Comprobante - Leitmix Producciones</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #121824;
                        margin: 0;
                        padding: 20px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .recibo-card {
                        background: #ffffff;
                        width: 100%;
                        max-width: 420px;
                        padding: 25px;
                        border-radius: 20px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                        box-sizing: border-box;
                        border-top: 6px solid #ffcc00;
                    }
                    .header-img {
                        text-align: center;
                        margin-bottom: 15px;
                        width: 100%;
                    }
                    .header-img img {
                        width: 100%;
                        height: auto;
                        display: block;
                        border-radius: 10px;
                    }
                    .titulo {
                        text-align: center;
                        font-weight: 800;
                        font-size: 0.95rem;
                        color: #444;
                        margin-bottom: 18px;
                        letter-spacing: 1px;
                        text-transform: uppercase;
                        border-bottom: 1px solid #eaeaea;
                        padding-bottom: 12px;
                    }
                    .info-box {
                        background: #f8f9fa;
                        border: 1px solid #e9ecef;
                        padding: 12px 16px;
                        border-radius: 12px;
                        margin-bottom: 15px;
                        display: flex;
                        justify-content: space-between;
                        font-size: 0.9rem;
                        font-weight: 600;
                        color: #333;
                    }
                    .cliente-box {
                        background: #f8f9fa;
                        border-left: 4px solid #ffcc00;
                        border-top: 1px solid #e9ecef;
                        border-right: 1px solid #e9ecef;
                        border-bottom: 1px solid #e9ecef;
                        padding: 15px;
                        border-radius: 12px;
                        margin-bottom: 15px;
                    }
                    .cliente-box p {
                        margin: 6px 0;
                        font-size: 0.95rem;
                        color: #333;
                    }
                    .monto-box {
                        background: #fffbe6;
                        border: 2px dashed #ffcc00;
                        text-align: center;
                        padding: 16px;
                        border-radius: 12px;
                        margin-bottom: 22px;
                    }
                    .monto-titulo {
                        font-size: 0.75rem;
                        font-weight: 800;
                        color: #b38600;
                        margin-bottom: 5px;
                        letter-spacing: 1.5px;
                    }
                    .monto-valor {
                        font-size: 1.8rem;
                        font-weight: bold;
                        color: #111;
                    }
                    .acciones {
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                    }
                    .btn-wsp {
                        background: #25d366;
                        color: white;
                        border: none;
                        padding: 14px;
                        border-radius: 12px;
                        font-size: 0.95rem;
                        font-weight: bold;
                        cursor: pointer;
                        text-align: center;
                        box-shadow: 0 4px 10px rgba(37, 211, 102, 0.3);
                    }
                    .btn-print {
                        background: #1f293d;
                        color: white;
                        border: none;
                        padding: 14px;
                        border-radius: 12px;
                        font-size: 0.95rem;
                        font-weight: bold;
                        cursor: pointer;
                        text-align: center;
                        box-shadow: 0 4px 10px rgba(31, 41, 61, 0.3);
                    }
                    @media print {
                        body { background: none; padding: 0; display: block; }
                        .recibo-card { border: none; box-shadow: none; max-width: 100%; padding: 10px; margin: 0 auto; }
                        .acciones { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="recibo-card">
                    <div class="header-img">
                        <img src="https://res.cloudinary.com/exzcoeyi/image/upload/l4y4rqa7bokko0mfafwm" alt="Leitmix Producciones">
                    </div>
                    <div class="titulo">Comprobante de Pago Oficial</div>
                    
                    <div class="info-box">
                        <span>N° Recibo: #${idRecibo}</span>
                        <span>Fecha: ${fecha}</span>
                    </div>

                    <div class="cliente-box">
                        <p><b>Cliente:</b> ${cliente}</p>
                        <p><b>Concepto:</b> ${detalle}</p>
                    </div>

                    <div class="monto-box">
                        <div class="monto-titulo">MONTO RECIBIDO</div>
                        <div class="monto-valor">$${Number(monto).toLocaleString()}</div>
                    </div>

                    <div class="acciones">
                        <button class="btn-wsp" onclick="window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent('🎧 *LEITMIX PRODUCCIONES* \\n\\nEstimado/a *${cliente}*, le confirmamos la recepción de su pago.\\n\\n💰 *Monto:* $' + Number(${monto}).toLocaleString() + '\\n📝 *Concepto:* ${detalle}\\n\\n¡Muchas gracias por confiar en nosotros! 🚀'), '_blank')">📱 Enviar por WhatsApp</button>
                        <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
                    </div>
                </div>
            </body>
        </html>
    `);
    ventanaImpresion.document.close();
};

// 6. Manejar Creación de Recibos
document.getElementById("reciboForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return alert("Debe iniciar sesión");

    const cliente = document.getElementById("reciboCliente").value;
    const monto = parseFloat(document.getElementById("reciboMonto").value);
    const detalle = document.getElementById("reciboDetalle").value;

    const { error } = await supabase.from("recibos").insert([{
        cliente,
        monto,
        detalle,
        user_id: session.user.id
    }]);

    if (error) {
        alert("Error al crear recibo: " + error.message);
    } else {
        alert("¡Recibo creado con éxito!");
        document.getElementById("reciboForm").reset();
        cargarPanelAdmin(session.user.id);
    }
});

// 7. Manejar Subida de Multimedia (Cloudinary)
document.getElementById("mediaForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return alert("Debe iniciar sesión");

    const fileInput = document.getElementById("mediaFile");
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "leitmix_preset");

    alert("Subiendo archivo... por favor esperá.");

    try {
        const response = await fetch("https://api.cloudinary.com/v1_1/exzcoeyi/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (data.secure_url) {
            const url = data.secure_url;
            const esVideo = file.type.startsWith("video");
            const tabla = esVideo ? "videos" : "fotos";

            const { error } = await supabase.from(tabla).insert([{
                url: url,
                user_id: session.user.id
            }]);

            if (error) {
                alert("Error al guardar en Supabase: " + error.message);
            } else {
                alert("¡Archivo subido con éxito!");
                fileInput.value = "";
                cargarPanelAdmin(session.user.id);
            }
        } else {
            console.error("Respuesta de Cloudinary:", data);
            alert("Error al subir a Cloudinary: " + (data.error?.message || "Revisar consola"));
        }
    } catch (err) {
        console.error("Error de red:", err);
        alert("Error de red o permisos al subir el archivo desde la App. Intentá de nuevo.");
    }
});

// 8. Funciones globales de Acciones (Eliminar / Modificar)
window.eliminarReserva = async function(id) {
    if (confirm("¿Estás seguro de eliminar esta reserva?")) {
        const { data: { session } } = await supabase.auth.getSession();
        const { error } = await supabase.from("reservas").delete().eq("id", id);
        if (error) alert("Error: " + error.message);
        else cargarPanelAdmin(session.user.id);
    }
};

window.eliminarRecibo = async function(id) {
    if (confirm("¿Estás seguro de eliminar este recibo?")) {
        const { data: { session } } = await supabase.auth.getSession();
        const { error } = await supabase.from("recibos").delete().eq("id", id);
        if (error) alert("Error: " + error.message);
        else cargarPanelAdmin(session.user.id);
    }
};

window.toggleTestimonio = async function(id, nuevoEstado) {
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from("testimonios").update({ activo: nuevoEstado }).eq("id", id);
    if (error) alert("Error: " + error.message);
    else cargarPanelAdmin(session.user.id);
};

window.eliminarTestimonio = async function(id) {
    if (confirm("¿Estás seguro de eliminar este testimonio?")) {
        const { data: { session } } = await supabase.auth.getSession();
        const { error } = await supabase.from("testimonios").delete().eq("id", id);
        if (error) alert("Error: " + error.message);
        else cargarPanelAdmin(session.user.id);
    }
};

window.eliminarMedia = async function(tabla, id) {
    if (confirm("¿Estás seguro de eliminar este archivo?")) {
        const { data: { session } } = await supabase.auth.getSession();
        const { error } = await supabase.from(tabla).delete().eq("id", id);
        if (error) alert("Error: " + error.message);
        else cargarPanelAdmin(session.user.id);
    }
};

// 9. Control del Modal de Configuración
const modalConfig = document.getElementById("modalConfig");
document.getElementById("btnConfig")?.addEventListener("click", () => {
    if (modalConfig) modalConfig.style.display = "flex";
});
document.getElementById("cerrarModal")?.addEventListener("click", () => {
    if (modalConfig) modalConfig.style.display = "none";
});

// 10. FUNCIONES DE REGISTRO Y RECUPERACIÓN DE CONTRASEÑA
const btnRegistrar = document.getElementById('btnRegistrar');
if (btnRegistrar) {
    btnRegistrar.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            alert("Por favor, ingresa un correo y una contraseña para registrarte.");
            return;
        }

        const { data, error } = await supabase.auth.signUp({ 
            email: email, 
            password: password 
        });

        if (error) {
            alert("Error al registrarse: " + error.message);
        } else {
            alert("¡Cuenta creada con éxito! Ya puedes iniciar sesión.");
        }
    });
}

const btnOlvido = document.getElementById('btnOlvido');
if (btnOlvido) {
    btnOlvido.addEventListener('click', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;

        const mensaje = email 
            ? `Hola! Necesito recuperar la contraseña de acceso al panel para el correo: ${email}` 
            : `Hola! Necesito recuperar la contraseña de acceso al panel de administración.`;
            
        const urlWhatsApp = `https://api.whatsapp.com/send?phone=5491150480339&text=${encodeURIComponent(mensaje)}`;
        window.open(urlWhatsApp, '_blank');
    });
}

// Ejecutar verificación de sesión al iniciar
verificarSesion();
