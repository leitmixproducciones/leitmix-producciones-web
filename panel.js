document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginSection = document.getElementById('loginSection');
    const adminSection = document.getElementById('adminSection');
    const btnLogout = document.getElementById('btnLogout');

    if (localStorage.getItem('sesion_activa') === 'true') {
        if (loginSection) loginSection.classList.add('hidden');
        if (adminSection) adminSection.classList.remove('hidden');
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('sesion_activa', 'true');
            if (loginSection) loginSection.classList.add('hidden');
            if (adminSection) adminSection.classList.remove('hidden');
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

window.verRecibo = function(cliente, monto, detalle, fecha, id) {
    const ventanaRecibo = window.open('', '_blank');
    ventanaRecibo.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Recibo #${id} - Leitmix</title>
            <style>
                body { background: #121212; font-family: sans-serif; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; color: #222; }
                .receipt { background: #fff; width: 100%; max-width: 480px; padding: 30px; border-radius: 16px; border-top: 8px solid #ffc107; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                h3 { font-size: 2rem; margin: 10px 0; }
                .btn { background: #25d366; color: white; padding: 14px; border-radius: 8px; font-weight: bold; text-align: center; text-decoration: none; display: block; margin-top: 15px; }
            </style>
        </head>
        <body>
            <div class="receipt">
                <h2>Leitmix Producciones</h2>
                <p><b>Cliente:</b> ${cliente}</p>
                <p><b>Concepto:</b> ${detalle}</p>
                <p><b>Fecha:</b> ${fecha}</p>
                <h3>$${Number(monto).toLocaleString('es-AR')}</h3>
                <a href="https://api.whatsapp.com/send?text=Hola%20*${encodeURIComponent(cliente)}*,%20te%20env%C3%ADo%20el%20comprobante%20de%20Leitmix%20Producciones.%20Monto:%20%24${Number(monto).toLocaleString('es-AR')}" target="_blank" class="btn">📲 Enviar por WhatsApp</a>
            </div>
        </body>
        </html>
    `);
};
