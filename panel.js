// ==========================================
// CONFIGURACIÓN DE TU LOGO (Reemplazá por tu link o nombre de archivo)
// ==========================================
const urlLogo = "URL_DE_TU_LOGO_AQUI"; 

// ==========================================
// GESTIÓN DE SESIÓN Y LOGIN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginSection = document.getElementById('loginSection');
    const adminSection = document.getElementById('adminSection');
    const loginError = document.getElementById('loginError');
    const btnLogout = document.getElementById('btnLogout');

    // Verificar si ya hay una sesión activa guardada
    if (localStorage.getItem('sesionActiva') === 'true') {
        mostrarAdmin(loginSection, adminSection);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('loginEmail');
            const passwordInput = document.getElementById('loginPassword');
            
            const email = emailInput ? emailInput.value : '';
            const password = passwordInput ? passwordInput.value : '';
            
            // Credenciales de acceso del panel
            if (email === "admin@leitmix.com" && password === "123456") {
                localStorage.setItem('sesionActiva', 'true');
                if (loginError) loginError.textContent = '';
                mostrarAdmin(loginSection, adminSection);
            } else {
                if (loginError) {
                    loginError.textContent = 'Correo o contraseña incorrectos.';
                } else {
                    alert('Correo o contraseña incorrectos.');
                }
            }
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('sesionActiva');
            if (adminSection) adminSection.classList.add('hidden');
            if (loginSection) loginSection.classList.remove('hidden');
        });
    }
});

function mostrarAdmin(loginSec, adminSec) {
    if (loginSec) loginSec.classList.add('hidden');
    if (adminSec) adminSec.classList.remove('hidden');
    
    // Llamada segura a la carga de datos si existe
    if (typeof cargarDatosAdmin === 'function') {
        cargarDatosAdmin();
    }
}

function cargarDatosAdmin() {
    console.log("Panel de administración cargado correctamente.");
}

// ==========================================
// GENERACIÓN DE RECIBOS OFICIALES
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
