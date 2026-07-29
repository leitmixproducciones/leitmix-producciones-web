import { supabase } from "./supabase.js";

const loginSection = document.getElementById("loginSection");
const adminSection = document.getElementById("adminSection");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const btnLogout = document.getElementById("btnLogout");
const userLoggedEmail = document.getElementById("userLoggedEmail");
const totalReservasEl = document.getElementById("totalReservas");

// 1. Verificar si hay sesión activa en Supabase al cargar
async function verificarSesion() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        mostrarPanel(session.user);
    } else {
        mostrarLogin();
    }
}

// 2. Manejar el inicio de sesión real multiusuario
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

// 3. Cerrar sesión
btnLogout?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    mostrarLogin();
});

function mostrarPanel(user) {
    if (loginSection) loginSection.classList.add("hidden");
    if (adminSection) adminSection.classList.remove("hidden");
    if (userLoggedEmail) userLoggedEmail.textContent = `Conectado como: ${user.email}`;
    
    cargarDatosAdmin();
    cargarTestimoniosAdmin();
}

function mostrarLogin() {
    if (adminSection) adminSection.classList.add("hidden");
    if (loginSection) loginSection.classList.remove("hidden");
    if (loginError) loginError.textContent = "";
}

// 4. Cargar métricas y gestiones del panel
async function cargarDatosAdmin() {
    const { count } = await supabase.from('reservas').select('*', { count: 'exact', head: true });
    if (totalReservasEl) totalReservasEl.textContent = count || 0;
}

async function cargarTestimoniosAdmin() {
    const contenedor = document.getElementById("listaTestimoniosAdmin");
    if (!contenedor) return;

    const { data: tests } = await supabase.from("testimonios").select("*").order("id", { ascending: false });

    if (!tests || tests.length === 0) {
        contenedor.innerHTML = '<p style="color: #888; text-align: center;">No hay testimonios para moderar.</p>';
        return;
    }

    contenedor.innerHTML = tests.map(t => `
        <div style="background: #2a2a2a; padding: 12px; border-radius: 6px; border: 1px solid #444;">
            <div style="display: flex; justify-content: space-between;">
                <strong style="color: #ffc107;">${t.nombre}</strong>
                <span style="font-size: 0.85rem; color: #aaa;">${"⭐".repeat(t.estrellas)}</span>
            </div>
            <p style="color: #ddd; font-size: 0.95rem; margin: 6px 0;">"${t.comentario}"</p>
            <div style="display: flex; gap: 8px; margin-top: 8px;">
                <button onclick="window.cambiarEstado(${t.id}, ${!t.aprobado})" style="background: ${t.aprobado ? '#ffc107' : '#28a745'}; color: #121212; border: none; padding: 6px; border-radius: 4px; font-weight: bold; cursor: pointer; flex: 1;">
                    ${t.aprobado ? 'Ocultar' : 'Aprobar'}
                </button>
            </div>
        </div>
    `).join("");
}

// Función global para cambiar el estado del testimonio desde los botones generados
window.cambiarEstado = async function(id, nuevoEstado) {
    const { error } = await supabase.from("testimonios").update({ aprobado: nuevoEstado }).eq("id", id);
    if (!error) {
        cargarTestimoniosAdmin();
    } else {
        alert("Error al actualizar.");
    }
};

verificarSesion();
