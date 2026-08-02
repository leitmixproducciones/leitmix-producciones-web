import { supabase } from "./supabase.js";

// ID de usuario predeterminado para tus registros
const USER_ID = "a6f7ed6c-a23d-4239-9a2b-3fdd421317ca";

// 1. Manejar el Inicio de Sesión
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
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
        cargarPanelAdmin();
    } else {
        if (loginSection) loginSection.style.display = "flex";
        if (adminSection) adminSection.style.display = "none";
    }
}

// 4. Cargar y Administrar Todos los Datos del Panel
async function cargarPanelAdmin() {
    // --- A. Cargar Reservas ---
    const { data: reservas } = await supabase.from("reservas").select("*").order("id", { ascending: false });
    const contReservas = document.getElementById("listaReservasAdmin");
    const totalReservasBadge = document.getElementById("totalReservas");
    
    if (totalReservasBadge) totalReservasBadge.textContent = reservas ? reservas.length : 0;

    if (contReservas) {
        if (reservas && reservas.length > 0) {
            contReservas.innerHTML = reservas.map(r => `
                <div style="background: var(--bg-input); padding: 12px; margin-bottom: 10px; border-radius: 10px; border: 1px solid var(--border-color);">
                    <p style="margin: 0 0 5px 0; font-weight: 600;">${r.nombre} - <span style="color: var(--accent);">${r.evento}</span></p>
                    <p style="margin: 0 0 8px 0; font-size: 0.85rem; color: var(--text-muted);">Fecha: ${r.fecha} | Tel: ${r.telefono}</p>
                    <button onclick="window.eliminarReserva(${r.id})" class="btn-danger-subtle" style="padding: 4px 10px; font-size: 0.75rem;">Eliminar</button>
                </div>
            `).join("");
        } else {
            contReservas.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No hay reservas registradas.</p>';
        }
    }

    // --- B. Cargar Recibos con botones de WhatsApp e Imprimir ---
    const { data: recibos } = await supabase.from("recibos").select("*").order("id", { ascending: false });
    const contRecibos = document.getElementById("listaRecibosAdmin");
    const totalRecibosBadge = document.getElementById("totalRecibos");

    let sumaTotal = 0;
    if (recibos && recibos.length > 0) {
        sumaTotal = recibos.reduce((acc, curr) => acc + Number(curr.monto || 0), 0);
    }
    if (totalRecibosBadge) totalRecibosBadge.textContent = `$${sumaTotal.toLocaleString()}`;

    if (contRecibos) {
        if (recibos && recibos.length > 0) {
            contRecibos.innerHTML = recibos.map(rec => `
                <div style="background: var(--bg-input); padding: 12px; margin-bottom: 10px; border-radius: 10px; border: 1px solid var(--border-color);">
                    <div style="margin-bottom: 8px;">
                        <p style="margin: 0 0 4px 0; font-weight: 600;">${rec.cliente} - <span style="color: var(--success);">$${Number(rec.monto).toLocaleString()}</span></p>
                        <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">Concepto: ${rec.detalle}</p>
                    </div>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                        <button onclick="window.enviarWhatsApp('${rec.cliente}', '${rec.monto}', '${rec.detalle}')" style="background: #25d366; color: #fff; border: none; padding: 5px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer;">💬 WhatsApp</button>
                        <button onclick="window.imprimirRecibo('${rec.cliente}', '${rec.monto}', '${rec.detalle}')" style="background: var(--accent); color: #0b0f19; border: none; padding: 5px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer;">🖨️ Imprimir</button>
                        <button onclick="window.eliminarRecibo(${rec.id})" class="btn-danger-subtle" style="padding: 4px 8px; font-size: 0.75rem;">Eliminar</button>
                    </div>
                </div>
            `).join("");
        } else {
            contRecibos.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No hay recibos creados.</p>';
        }
    }

    // --- C. Cargar Testimonios para moderar ---
    const { data: testimonios } = await supabase.from("testimonios").select("*").order("id", { ascending: false });
    const contTestimonios = document.getElementById("listaTestimoniosAdmin");
    if (contTestimonios) {
        if (testimonios && testimonios.length > 0) {
            contTestimonios.innerHTML = testimonios.map(t => `
                <div style="background: var(--bg-input); padding: 12px; margin-bottom: 10px; border-radius: 10px; border: 1px solid var(--border-color);">
                    <p style="margin: 0 0 4px 0; font-weight: 600;">${t.nombre} <span style="font-weight: normal;">(${"⭐".repeat(t.estrellas)})</span></p>
                    <p style="margin: 0 0 8px 0; font-size: 0.9rem; color: var(--text-muted);">"${t.mensaje}"</p>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="window.toggleTestimonio(${t.id}, ${!t.activo})" class="btn-primary" style="padding: 4px 10px; font-size: 0.75rem; width: auto; background: ${t.activo ? 'var(--text-muted)' : 'var(--success)'};">${t.activo ? 'Ocultar' : 'Aprobar'}</button>
                        <button onclick="window.eliminarTestimonio(${t.id})" class="btn-danger-subtle" style="padding: 4px 10px; font-size: 0.75rem;">Eliminar</button>
                    </div>
                </div>
            `).join("");
        } else {
            contTestimonios.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No hay testimonios para moderar.</p>';
        }
    }

    // --- D. Cargar Multimedia (Fotos y Videos) ---
    const contMedia = document.getElementById("listaMediaAdmin");
    if (contMedia) {
        const { data: fotos } = await supabase.from("fotos").select("*").order("id", { ascending: false });
        const { data: videos } = await supabase.from("videos").select("*").order("id", { ascending: false });

        let mediaHTML = "";

        if (fotos && fotos.length > 0) {
            mediaHTML += `<h4 style="color: var(--text-muted); margin: 10px 0 5px 0; font-size: 0.9rem;">Fotos</h4>`;
            mediaHTML += fotos.map(f => `
                <div style="background: var(--bg-input); padding: 10px; margin-bottom: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--border-color);">
                    <img src="${f.url}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" alt="Foto">
                    <button onclick="window.eliminarMedia('fotos', ${f.id})" class="btn-danger-subtle" style="padding: 4px 8px; font-size: 0.7rem;">Borrar</button>
                </div>
            `).join("");
        }

        if (videos && videos.length > 0) {
            mediaHTML += `<h4 style="color: var(--text-muted); margin: 15px 0 5px 0; font-size: 0.9rem;">Videos</h4>`;
            mediaHTML += videos.map(v => `
                <div style="background: var(--bg-input); padding: 10px; margin-bottom: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--border-color);">
                    <span style="font-size: 0.85rem; color: var(--text-main); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px;">Video ID: ${v.id}</span>
                    <button onclick="window.eliminarMedia('videos', ${v.id})" class="btn-danger-subtle" style="padding: 4px 8px; font-size: 0.7rem;">Borrar</button>
                </div>
            `).join("");
        }

        if ((!fotos || fotos.length === 0) && (!videos || videos.length === 0)) {
            mediaHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No hay archivos multimedia cargados.</p>';
        }

        contMedia.innerHTML = mediaHTML;
    }
}

// 5. Funciones de Recibos (WhatsApp e Imprimir)
window.enviarWhatsApp = function(cliente, monto, detalle) {
    const mensaje = `🎧 *LEITMIX PRODUCCIONES* \n\nEstimado/a *${cliente}*, le confirmamos la recepción de su pago.\n\n💰 *Monto:* $${Number(monto).toLocaleString()}\n📝 *Concepto:* ${detalle}\n\n¡Muchas gracias por confiar en nosotros! 🚀`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
};

window.imprimirRecibo = function(cliente, monto, detalle) {
    const ventanaImpresion = window.open('', '_blank');
    ventanaImpresion.document.write(`
        <html>
            <head>
                <title>Comprobante - Leitmix Producciones</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; color: #000; max-width: 400px; margin: 0 auto; }
                    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                    .info { margin-bottom: 10px; font-size: 1rem; }
                    .monto { font-size: 1.4rem; font-weight: bold; margin: 20px 0; text-align: center; background: #eee; padding: 10px; border-radius: 6px; }
                    .footer { text-align: center; margin-top: 40px; font-size: 0.85rem; color: #555; border-top: 1px dashed #ccc; padding-top: 10px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>LEITMIX PRODUCCIONES</h2>
                    <p>Comprobante de Pago / Seña</p>
                </div>
                <div class="info"><b>Cliente:</b> ${cliente}</div>
                <div class="info"><b>Concepto:</b> ${detalle}</div>
                <div class="monto">Total: $${Number(monto).toLocaleString()}</div>
                <div class="footer">
                    <p>¡Gracias por elegirnos!</p>
                </div>
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
        </html>
    `);
    ventanaImpresion.document.close();
};

// 6. Manejar Creación de Recibos
document.getElementById("reciboForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const cliente = document.getElementById("reciboCliente").value;
    const monto = parseFloat(document.getElementById("reciboMonto").value);
    const detalle = document.getElementById("reciboDetalle").value;

    const { error } = await supabase.from("recibos").insert([{
        cliente,
        monto,
        detalle,
        user_id: USER_ID
    }]);

    if (error) {
        alert("Error al crear recibo: " + error.message);
    } else {
        alert("¡Recibo creado con éxito!");
        document.getElementById("reciboForm").reset();
        cargarPanelAdmin();
    }
});

// 7. Manejar Subida de Multimedia (Cloudinary)
document.getElementById("mediaForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById("mediaFile");
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "preset_leitmix");

    alert("Subiendo archivo... por favor esperá.");

    try {
        const response = await fetch("https://api.cloudinary.com/v1_1/dskg3j23x/upload", {
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
                user_id: USER_ID
            }]);

            if (error) {
                alert("Error al guardar en Supabase: " + error.message);
            } else {
                alert("¡Archivo subido con éxito!");
                fileInput.value = "";
                cargarPanelAdmin();
            }
        } else {
            alert("Error al subir a Cloudinary.");
        }
    } catch (err) {
        alert("Error de red al subir el archivo.");
    }
});

// 8. Funciones globales de Acciones (Eliminar / Modificar)
window.eliminarReserva = async function(id) {
    if (confirm("¿Estás seguro de eliminar esta reserva?")) {
        const { error } = await supabase.from("reservas").delete().eq("id", id);
        if (error) alert("Error: " + error.message);
        else cargarPanelAdmin();
    }
};

window.eliminarRecibo = async function(id) {
    if (confirm("¿Estás seguro de eliminar este recibo?")) {
        const { error } = await supabase.from("recibos").delete().eq("id", id);
        if (error) alert("Error: " + error.message);
        else cargarPanelAdmin();
    }
};

window.toggleTestimonio = async function(id, nuevoEstado) {
    const { error } = await supabase.from("testimonios").update({ activo: nuevoEstado }).eq("id", id);
    if (error) alert("Error: " + error.message);
    else cargarPanelAdmin();
};

window.eliminarTestimonio = async function(id) {
    if (confirm("¿Estás seguro de eliminar este testimonio?")) {
        const { error } = await supabase.from("testimonios").delete().eq("id", id);
        if (error) alert("Error: " + error.message);
        else cargarPanelAdmin();
    }
};

window.eliminarMedia = async function(tabla, id) {
    if (confirm("¿Estás seguro de eliminar este archivo?")) {
        const { error } = await supabase.from(tabla).delete().eq("id", id);
        if (error) alert("Error: " + error.message);
        else cargarPanelAdmin();
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

// Ejecutar verificación de sesión al iniciar
verificarSesion();
