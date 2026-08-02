import { supabase } from "./supabase.js";

// ID de usuario predeterminado para tus registros
const USER_ID = "a6f7ed6c-a23d-4239-9a2b-3fdd421317ca";

// 1. Manejar el Inicio de Sesión
document.getElementById("formLogin")?.addEventListener("submit", async (e) => {
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
        alert("¡Bienvenido al panel!");
        verificarSesion();
    }
});

// 2. Verificar Estado de la Sesión
async function verificarSesion() {
    const { data: { session } } = await supabase.auth.getSession();
    
    const seccionLogin = document.getElementById("seccionLogin");
    const seccionAdmin = document.getElementById("seccionAdmin");

    if (session) {
        if (seccionLogin) seccionLogin.style.display = "none";
        if (seccionAdmin) seccionAdmin.style.display = "block";
        cargarPanelAdmin();
    } else {
        if (seccionLogin) seccionLogin.style.display = "block";
        if (seccionAdmin) seccionAdmin.style.display = "none";
    }
}

// 3. Cargar y Administrar Datos dentro del Panel
async function cargarPanelAdmin() {
    // Cargar Reservas
    const { data: reservas } = await supabase.from("reservas").select("*").order("id", { ascending: false });
    const contReservas = document.getElementById("reservasAdmin");
    if (contReservas) {
        if (reservas && reservas.length > 0) {
            contReservas.innerHTML = reservas.map(r => `
                <div style="background: #222; padding: 12px; margin-bottom: 10px; border-radius: 6px; border: 1px solid #444;">
                    <p style="color: #fff; margin: 0 0 5px 0;"><b>${r.nombre}</b> - ${r.evento} (${r.fecha})</p>
                    <p style="color: #aaa; font-size: 0.85rem; margin: 0 0 5px 0;">Tel: ${r.telefono} | Comentario: ${r.comentarios || 'Ninguno'}</p>
                    <button onclick="eliminarReserva(${r.id})" style="background: #d9534f; color: #fff; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Eliminar</button>
                </div>
            `).join("");
        } else {
            contReservas.innerHTML = '<p style="color: #888;">No hay reservas registradas.</p>';
        }
    }

    // Cargar Testimonios para aprobar o rechazar
    const { data: testimonios } = await supabase.from("testimonios").select("*").order("id", { ascending: false });
    const contTestimonios = document.getElementById("testimoniosAdmin");
    if (contTestimonios) {
        if (testimonios && testimonios.length > 0) {
            contTestimonios.innerHTML = testimonios.map(t => `
                <div style="background: #222; padding: 12px; margin-bottom: 10px; border-radius: 6px; border: 1px solid #444;">
                    <p style="color: #fff; margin: 0 0 5px 0;"><b>${t.nombre}</b> (${"⭐".repeat(t.estrellas)})</p>
                    <p style="color: #ddd; font-size: 0.9rem; margin: 0 0 5px 0;">"${t.mensaje}"</p>
                    <p style="color: ${t.activo ? '#5cb85c' : '#f0ad4e'}; font-size: 0.8rem; margin: 0 0 8px 0;">Estado: ${t.activo ? 'Aprobado (Visible)' : 'Pendiente'}</p>
                    <button onclick="toggleTestimonio(${t.id}, ${!t.activo})" style="background: ${t.activo ? '#f0ad4e' : '#5cb85c'}; color: #fff; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">${t.activo ? 'Ocultar' : 'Aprobar'}</button>
                    <button onclick="eliminarTestimonio(${t.id})" style="background: #d9534f; color: #fff; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Eliminar</button>
                </div>
            `).join("");
        } else {
            contTestimonios.innerHTML = '<p style="color: #888;">No hay testimonios.</p>';
        }
    }
}

// 4. Funciones de Acciones (Eliminar / Modificar)
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

// Ejecutar verificación al cargar la página del panel
verificarSesion();
