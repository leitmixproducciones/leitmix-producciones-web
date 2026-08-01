// ==========================================
// CONFIGURACIÓN DE TU LOGO
// ==========================================
const urlLogo = "URL_DE_TU_LOGO_AQUI"; 

// ==========================================
// CONTROL DE ACCESO Y CARGA DEL PANEL
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginSection = document.getElementById('loginSection');
    const adminSection = document.getElementById('adminSection');
    const btnLogout = document.getElementById('btnLogout');
    const loginError = document.getElementById('loginError');

    // Verificar si ya hay sesión activa
    if (localStorage.getItem('sesion_activa') === 'true') {
        abrirPanel(loginSection, adminSection);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Acceso libre para evitar bloqueos
            localStorage.setItem('sesion_activa', 'true');
            abrirPanel(loginSection, adminSection);
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('sesion_activa');
            if (adminSection) adminSection.classList.add('hidden');
            if (loginSection) loginSection.classList.remove('hidden');
        });
    }
});

// Función global por si hace clic en recuperar contraseña
window.recuperarPassword = function() {
    alert("Para ingresar, podés usar cualquier correo y contraseña configurados en el acceso directo.");
};

function abrirPanel(loginSec, adminSec) {
    if (loginSec) loginSec.classList.add('hidden');
    if (adminSec) adminSec.classList.remove('hidden');
    
    // Iniciar carga de datos de Supabase
    if (typeof cargarDatosAdmin === 'function') {
        cargarDatosAdmin();
    }
}

// ==========================================
// CONEXIÓN CON SUPABASE PARA CARGAR LAS TABLAS
// ==========================================
async function cargarDatosAdmin() {
    console.log("Cargando datos del panel desde Supabase...");

    if (typeof supabase === 'undefined') {
        console.warn("El cliente de Supabase no está disponible.");
        return;
    }

    try {
        // 1. Cargar Reservas y calcular total
        const { data: reservas, error: errRes } = await supabase.from('reservas').select('*');
        if (!errRes && reservas) {
            renderizarReservasAdmin(reservas);
        }

        // 2. Cargar Recibos Emitidos y calcular recaudación
        const { data: recibos, error: errRec } = await supabase.from('recibos').select('*');
        if (!errRec && recibos) {
            renderizarRecibosAdmin(recibos);
        }

        // 3. Cargar Contenido Multimedia
        const { data: multimedia, error: errMulti } = await supabase.from('multimedia').select('*');
        if (!errMulti && multimedia) {
            renderizarMultimediaAdmin(multimedia);
        }

        // 4. Cargar Testimonios
        const { data: testimonios, error: errTest } = await supabase.from('testimonios').select('*');
        if (!errTest && testimonios) {
            renderizarTestimoniosAdmin(testimonios);
        }

    } catch (e) {
        console.error("Error al sincronizar con Supabase:", e);
    }
}

// Funciones de renderizado conectadas a los IDs exactos de tu panel.html
function renderizarReservasAdmin(reservas) {
    const contenedor = document.getElementById('listaReservasAdmin');
    const contadorTotal = document.getElementById('totalReservas');
    
    if (contadorTotal) contadorTotal.textContent = reservas.length;
    if (!contenedor) return;
    
    if (reservas.length === 0) {
        contenedor.innerHTML = '<p style="color: #888; text-align: center; font-size: 0.9rem;">No hay reservas registradas.</p>';
        return;
    }
    
    contenedor.innerHTML = reservas.map(r => `
        <div style="background: #2a2a2a; padding: 12px; border-radius: 8px; border-left: 4px solid #ffc107; font-size: 0.9rem;">
            <p><b>Cliente:</b> ${r.nombre || r.cliente || 'Sin nombre'}</p>
            <p><b>Evento:</b> ${r.evento || 'No especificado'} - <b>Fecha:</b> ${r.fecha || ''}</p>
            <p><b>Teléfono:</b> ${r.telefono || '-'}</p>
        </div>
    `).join('');
}

function renderizarRecibosAdmin(recibos) {
    const contenedor = document.getElementById('listaRecibosAdmin');
    const recaudadoTotal = document.getElementById('totalRecibos');
    
    if (!contenedor) return;

    if (recibos.length === 0) {
        contenedor.innerHTML = '<p style="color: #888; text-align: center; font-size: 0.9rem;">No hay recibos emitidos todavía.</p>';
        if (recaudadoTotal) recaudadoTotal.textContent = "$0";
        return;
    }

    // Calcular suma total recaudada
    let totalSuma = recibos.reduce((acc, curr) => acc + Number(curr.monto || 0), 0);
    if (recaudadoTotal) recaudadoTotal.textContent = `$${totalSuma.toLocaleString('es-AR')}`;

    contenedor.innerHTML = recibos.map(rec => `
        <div style="background: #2a2a2a; padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem;">
            <div>
                <p><b>Cliente:</b> ${rec.cliente}</p>
                <p><b>Monto:</b> $${Number(rec.monto).toLocaleString('es-AR')} - <b>Concepto:</b> ${rec.detalle}</p>
            </div>
            <button type="button" onclick="verRecibo('${rec.cliente}', '${rec.monto}', '${rec.detalle}', '${rec.fecha}', '${rec.id}')" style="background:#ffc107; color:#121212; border:none; padding:8px 10px; border-radius:6px; font-weight:bold; cursor:pointer; width:auto; margin-bottom:0;">Ver</button>
        </div>
    `).join('');
}

function renderizarMultimediaAdmin(multimedia) {
    const contenedor = document.getElementById('listaMediaAdmin');
    if (!contenedor) return;
    
    if (multimedia.length === 0) {
        contenedor.innerHTML = '<p style="color: #888; text-align: center; font-size: 0.9rem;">No hay archivos multimedia cargados.</p>';
        return;
    }
    
    contenedor.innerHTML = multimedia.map(m => `
        <div style="background: #2a2a2a; padding: 8px; border-radius: 8px; text-align: center;">
            <img src="${m.url}" style="max-width:100%; height:80px; object-fit:cover; border-radius:6px;" />
        </div>
    `).join('');
}

function renderizarTestimoniosAdmin(testimonios) {
    const contenedor = document.getElementById('listaTestimoniosAdmin');
    if (!contenedor) return;

    if (testimonios.length === 0) {
        contenedor.innerHTML = '<p style="color: #888; text-align: center; font-size: 0.9rem;">No hay testimonios para moderar.</p>';
        return;
    }

    contenedor.innerHTML = testimonios.map(t => `
        <div style="background: #2a2a2a; padding: 10px; border-radius: 8px; font-size: 0.9rem;">
            <p><b>${t.nombre}</b> (${t.estrellas} ⭐)</p>
            <p style="color: #bbb; font-style: italic;">"${t.comentario}"</p>
        </div>
    `).join('');
}


// ==========================================
// GENERACIÓN DE RECIBOS OFICIALES (Con Logo y Estilo)
// ==========================================
window.verRecibo = function(cliente, monto, detalle, fecha, id) {
    const ventanaRecibo = window.open('', '_blank');
    ventanaRecibo.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Recibo Oficial #${id} - Leitmix Producciones</title>
            <style>
                * { box-sizing: border-box; }
                body { background: #121212; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
                .receipt-container { background: #ffffff; width: 100%; max-width: 480px; padding: 30px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border-top: 8px solid #ffc107; color: #222; }
                .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
                .logo-img { max-width: 150px; height: auto; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto; }
                .logo-fallback { font-size: 1.4rem; font-weight: 900; color: #121212; letter-spacing: 1px; margin-bottom: 5px; }
                .logo-fallback span { color: #ffc107; background: #121212; padding: 2px 6px; border-radius: 4px; }
                .sub-title { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px; color: #666; font-weight: 600; margin-top: 6px; }
                .receipt-meta { display: flex; justify-content: space-between; background: #f8f9fa; padding: 10px 14px; border-radius: 8px; margin-bottom: 20px; font-size: 0.85rem; border: 1px solid #e2e8f0; }
                .client-section { margin-bottom: 20px; font-size: 0.95rem; background: #fafafa; padding: 14px; border-radius: 8px; border-left: 4px solid #ffc107; }
                .client-section p { margin: 6px 0; color: #444; }
                .client-section span { font-weight: bold; color: #111; }
                .monto-box { background: #fff9e6; border: 2px dashed #ffc107; padding: 18px; text-align: center; border-radius: 10px; margin: 20px 0; }
                .monto-box p { margin: 0 0 5px 0; font-size: 0.8rem; color: #b7791f; font-weight: bold; text-transform: uppercase; }
                .monto-box h3 { color: #121212; margin: 0; font-size: 2rem; font-weight: 800; }
                .actions { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
                .btn-whatsapp { background: #25d366; color: white; border: none; padding: 14px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1rem; text-align: center; text-decoration: none; display: block; box-shadow: 0 4px 10px rgba(37, 211, 102, 0.3); }
                .btn-print { background: #2d3748; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.9rem; text-align: center; }
                .footer { text-align: center; font-size: 0.75rem; color: #666; border-top: 1px solid #eee; padding-top: 15px; margin-top: 20px; }
                .social-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 8px; font-weight: bold; color: #b7791f; font-size: 0.75rem; }
            </style>
        </head>
        <body>
            <div class="receipt-container">
                <div class="header">
                    <img src="${urlLogo}" alt="Leitmix Logo" class="logo-img" onerror="this.style.display='none'; document.getElementById('fallback-logo').style.display='block';">
                    <div id="fallback-logo" class="logo-fallback" style="display:none;">LEITMIX<span>PRODUCCIONES</span></div>
                    <div class="sub-title">Comprobante de Pago Oficial</div>
                </div>

                <div class="receipt-meta">
                    <div><span>N° Recibo:</span> <b>#000${id}</b></div>
                    <div><span>Fecha:</span> <b>${fecha}</b></div>
                </div>

                <div class="client-section">
                    <p><span>Cliente:</span> ${cliente}</p>
                    <p><span>Concepto:</span> ${detalle}</p>
                </div>

                <div class="monto-box">
                    <p>Monto Recibido</p>
                    <h3>$${Number(monto).toLocaleString('es-AR')}</h3>
                </div>

                <div class="actions">
                    <a href="https://api.whatsapp.com/send?text=Hola%20*${encodeURIComponent(cliente)}*,%20te%20env%C3%ADo%20el%20comprobante%20oficial%20de%20Leitmix%20Producciones.%0A%0A*Recibo%20N%C2%B0:*%20%23000${id}%0A*Fecha:*%20${fecha}%0A*Concepto:*%20${encodeURIComponent(detalle)}%0A*Monto:*%20%24${Number(monto).toLocaleString('es-AR')}%0A%0A%C2%A1Muchas%20gracias%20por%20confiar%20en%20nosotros!" target="_blank" class="btn-whatsapp">
                        📲 Enviar por WhatsApp
                    </a>
                    <button onclick="window.print()" class="btn-print">🖨️ Imprimir / Guardar PDF</button>
                </div>

                <div class="footer">
                    <p><b>Leitmix Producciones</b> - Calidad y Profesionalismo en cada Evento</p>
                    <div class="social-links">
                        <span>📷 IG: @leitmixproducciones</span>
                        <span>🌐 Web: leitmixproducciones.github.io</span>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
};
