import { supabase } from "./supabase.js";

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

// 4. Cargar y Administrar Datos dentro del Panel
async function cargarPanelAdmin() {
    // Cargar Reservas
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

    // Cargar Testimonios para moderar
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
}

// 5. Funciones globales de Acciones (Eliminar / Modificar)
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

// 6. Control del Modal de Configuración
const modalConfig = document.getElementById("modalConfig");
document.getElementById("btnConfig")?.addEventListener("click", () => {
    if (modalConfig) modalConfig.style.display = "flex";
});
document.getElementById("cerrarModal")?.addEventListener("click", () => {
    if (modalConfig) modalConfig.style.display = "none";
});

// Ejecutar verificación de sesión al iniciar
verificarSesion();
