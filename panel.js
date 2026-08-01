import { supabase } from "./supabase.js";

const loginSection = document.getElementById("loginSection");
const adminSection = document.getElementById("adminSection");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const btnLogout = document.getElementById("btnLogout");
const userLoggedEmail = document.getElementById("userLoggedEmail");
const totalReservasEl = document.getElementById("totalReservas");

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

// Función para recuperar contraseña desde la misma interfaz
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
    cargarMediaAdmin();
    cargarTestimoniosAdmin();
}

function mostrarLogin() {
    if (adminSection) adminSection.classList.add("hidden");
    if (loginSection) loginSection.classList.remove("hidden");
    if (loginError) loginError.textContent = "";
}

// Cargar y listar Reservas en el Panel
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

// Subida directa a Cloudinary
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

        if (!response.ok) {
            throw new Error(data.error?.message || "Error al subir a Cloudinary");
        }

        const publicUrl = data.secure_url;

        const { error: dbError } = await supabase
            .from(tablaDestino)
            .insert([{ url: publicUrl }]);

        if (dbError) {
            alert(`Error al guardar en la tabla ${tablaDestino}: ` + dbError.message);
        } else {
            alert(`¡${esVideo ? 'Video' : 'Foto'} subido con éxito a Cloudinary!`);
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

    contenedor.innerHTML = totalItems.map(m => {
        let vistaPrevia = '';
        if (m.tipo === 'foto') {
            vistaPrevia = `<img src="${m.url}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 4px;" alt="Miniatura">`;
        } else {
            vistaPrevia = `<video src="${m.url}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 4px; background: #000;"></video>`;
        }

        return `
            <div style="background: #2a2a2a; padding: 8px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #444; gap: 10px; margin-bottom: 6px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${vistaPrevia}
                    <a href="${m.url}" target="_blank" style="color: #ffc107; text-decoration: none; font-size: 0.85rem;">Ver ${m.tipo}</a>
                </div>
                <button onclick="window.eliminarMedia(${m.id}, '${m.tipo}')" style="background: #dc3545; color: #fff; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Eliminar</button>
            </div>
        `;
    }).join("");
}

window.eliminarMedia = async function(id, tipo) {
    if (confirm("¿Estás seguro de borrar este archivo?")) {
        const tabla = tipo === 'video' ? 'videos' : 'fotos';
        const { error } = await supabase.from(tabla).delete().eq("id", id);
        if (!error) cargarMediaAdmin();
        else alert("Error al eliminar.");
    }
};

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
