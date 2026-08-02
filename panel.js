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

    // --- B. Cargar Testimonios para moderar ---
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

    // --- C. Cargar Multimedia (Fotos y Videos) ---
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

// 5. Manejar Subida de Multimedia (Cloudinary)
document.getElementById("mediaForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById("mediaFile");
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "preset_leitmix"); // Reemplazá con tu preset de Cloudinary si usás otro

    alert("Subiendo archivo... por favor esperá.");

    try {
        const response = await fetch("https://api.cloudinary.com/v1_1/dskg3j23x/upload", { // Tu nube de Cloudinary
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

// 6. Funciones globales de Acciones (Eliminar / Modificar)
window.eliminarReserva = async function(id) {
    if (confirm("¿Estás seguro de eliminar esta reserva?")) {
        const { error } = await supabase.from("reservas").delete().eq("id", id);
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

// 7. Control del Modal de Configuración
const modalConfig = document.getElementById("modalConfig");
document.getElementById("btnConfig")?.addEventListener("click", () => {
    if (modalConfig) modalConfig.style.display = "flex";
});
document.getElementById("cerrarModal")?.addEventListener("click", () => {
    if (modalConfig) modalConfig.style.display = "none";
});

// Ejecutar verificación de sesión al iniciar
verificarSesion();
