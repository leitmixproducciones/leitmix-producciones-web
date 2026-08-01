import { supabase } from "./supabase.js";

const CLOUD_NAME = 'exzcoeyi'; 
const UPLOAD_PRESET = 'leitmix_preset'; 

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginSection = document.getElementById('loginSection');
    const adminSection = document.getElementById('adminSection');
    const btnLogout = document.getElementById('btnLogout');

    if (localStorage.getItem('sesion_activa') === 'true') {
        abrirPanel(loginSection, adminSection);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
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

function abrirPanel(loginSec, adminSec) {
    if (loginSec) loginSec.classList.add('hidden');
    if (adminSec) adminSec.classList.remove('hidden');
    cargarDatosAdmin();
}

async function cargarDatosAdmin() {
    try {
        const { data: reservas } = await supabase.from('reservas').select('*').order('id', { ascending: false });
        const contReservas = document.getElementById('listaReservasAdmin');
        const totalRes = document.getElementById('totalReservas');
        
        if (totalRes) totalRes.textContent = reservas ? reservas.length : 0;
        
        if (contReservas) {
            if (reservas && reservas.length > 0) {
                contReservas.innerHTML = reservas.map(r => `
                    <div style="background: #2a2a2a; padding: 12px; border-radius: 8px; border-left: 4px solid #ffc107; font-size: 0.9rem;">
                        <p><b>Cliente:</b> ${r.nombre}</p>
                        <p><b>Evento:</b> ${r.evento || 'No especificado'} - <b>Fecha:</b> ${r.fecha || ''}</p>
                        <p><b>Teléfono:</b> ${r.telefono || '-'}</p>
                        ${r.comentarios ? `<p style="color: #aaa; font-style: italic;">Comentarios: ${r.comentarios}</p>` : ''}
                    </div>
                `).join('');
            } else {
                contReservas.innerHTML = '<p style="color: #888; text-align: center; font-size: 0.9rem;">No hay reservas registradas.</p>';
            }
        }

        const { data: recibos } = await supabase.from('recibos').select('*').order('id', { ascending: false });
        const contRecibos = document.getElementById('listaRecibosAdmin');
        const totalRec = document.getElementById('totalRecibos');
        
        if (recibos && recibos.length > 0) {
            let sumaTotal = recibos.reduce((acc, curr) => acc + Number(curr.monto || 0), 0);
            if (totalRec) totalRec.textContent = `$${sumaTotal.toLocaleString('es-AR')}`;
            
            if (contRecibos) {
                contRecibos.innerHTML = recibos.map(rec => {
                    const fechaRecibo = rec.fecha || new Date().toLocaleDateString('es-AR');
                    return `
                        <div style="background: #2a2a2a; padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem;">
                            <div>
                                <p><b>Cliente:</b> ${rec.cliente}</p>
                                <p><b>Monto:</b> $${Number(rec.monto).toLocaleString('es-AR')} - <b>Concepto:</b> ${rec.detalle}</p>
                                <p style="font-size: 0.8rem; color: #aaa;"><b>Fecha:</b> ${fechaRecibo}</p>
                            </div>
                            <button type="button" onclick="verRecibo('${rec.cliente}', '${rec.monto}', '${rec.detalle}', '${rec.id}', '${fechaRecibo}')" style="background:#ffc107; color:#121212; border:none; padding:8px 10px; border-radius:6px; font-weight:bold; cursor:pointer; width:auto; margin-bottom:0;">Ver</button>
                        </div>
                    `;
                }).join('');
            }
        } else {
            if (totalRec) totalRec.textContent = "$0";
            if (contRecibos) contRecibos.innerHTML = '<p style="color: #888; text-align: center; font-size: 0.9rem;">No hay recibos emitidos todavía.</p>';
        }

        await cargarMultimediaAdmin();

        const { data: testimonios } = await supabase.from('testimonios').select('*').order('id', { ascending: false });
        const contTest = document.getElementById('listaTestimoniosAdmin');
        if (contTest) {
            if (testimonios && testimonios.length > 0) {
                contTest.innerHTML = testimonios.map(t => `
                    <div style="background: #2a2a2a; padding: 10px; border-radius: 8px; font-size: 0.9rem; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <p><b>${t.nombre}</b> (${t.estrellas} ⭐) - Estado: ${t.activo ? '🟢 Aprobado' : '🟡 Pendiente'}</p>
                            <p style="color: #bbb; font-style: italic;">"${t.mensaje}"</p>
                        </div>
                        <button type="button" onclick="cambiarEstadoTestimonio('${t.id}', ${!t.activo})" style="background:${t.activo ? '#dc3545' : '#28a745'}; color:#fff; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; width:auto; margin-bottom:0; font-size:0.8rem;">
                            ${t.activo ? 'Desactivar' : 'Aprobar'}
                        </button>
                    </div>
                `).join('');
            } else {
                contTest.innerHTML = '<p style="color: #888; text-align: center; font-size: 0.9rem;">No hay testimonios.</p>';
            }
        }

    } catch (e) {
        console.error("Error al cargar datos en el panel:", e);
    }
}

window.cambiarEstadoTestimonio = async function(id, nuevoEstado) {
    const { error } = await supabase.from('testimonios').update({ activo: nuevoEstado }).eq('id', id);
    if (!error) cargarDatosAdmin();
    else alert("Error al actualizar testimonio");
};

async function cargarMultimediaAdmin() {
    const contMedia = document.getElementById('listaMediaAdmin');
    if (!contMedia) return;

    const { data: fotos } = await supabase.from('fotos').select('*').order('id', { ascending: false });
    const { data: videos } = await supabase.from('videos').select('*').order('id', { ascending: false });
    
    let htmlContenido = '';

    if (fotos && fotos.length > 0) {
        htmlContenido += `<h4 style="color: #ffc107; font-size: 0.9rem; margin-bottom: 5px;">📷 Fotos Cargadas</h4>`;
        htmlContenido += fotos.map(f => `
            <div style="background: #2a2a2a; padding: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <img src="${f.url}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;" alt="Foto">
                <button type="button" onclick="eliminarMedia('${f.id}', 'fotos')" style="background: #dc3545; color: #fff; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; width: auto; margin-bottom: 0; font-size: 0.8rem;">Eliminar</button>
            </div>
        `).join('');
    }

    if (videos && videos.length > 0) {
        htmlContenido += `<h4 style="color: #ffc107; font-size: 0.9rem; margin: 10px 0 5px 0;">🎥 Videos Cargados</h4>`;
        htmlContenido += videos.map(v => `
            <div style="background: #2a2a2a; padding: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <video src="${v.url}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; background: #000;" preload="metadata"></video>
                <button type="button" onclick="eliminarMedia('${v.id}', 'videos')" style="background: #dc3545; color: #fff; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; width: auto; margin-bottom: 0; font-size: 0.8rem;">Eliminar</button>
            </div>
        `).join('');
    }

    if ((!fotos || fotos.length === 0) && (!videos || videos.length === 0)) {
        contMedia.innerHTML = '<p style="color: #888; text-align: center; font-size: 0.9rem;">No hay archivos multimedia cargados.</p>';
    } else {
        contMedia.innerHTML = htmlContenido;
    }
}

document.getElementById('mediaForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('mediaFile');
    const file = fileInput.files[0];
    if (!file) return;

    const btnSubir = e.target.querySelector('button');
    btnSubir.textContent = "Subiendo...";
    btnSubir.disabled = true;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const tipoEsVideo = file.type.startsWith('video');
        const resourceType = tipoEsVideo ? 'video' : 'image';

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (data.secure_url) {
            const tabla = tipoEsVideo ? 'videos' : 'fotos';
            const { error } = await supabase.from(tabla).insert([{ url: data.secure_url }]);

            if (error) {
                alert("Error al guardar en la base de datos: " + error.message);
            } else {
                alert("¡Archivo subido con éxito!");
                fileInput.value = '';
                cargarMultimediaAdmin();
            }
        } else {
            alert("Error al subir a Cloudinary.");
        }
    } catch (err) {
        console.error(err);
        alert("Hubo un error en la subida.");
    } finally {
        btnSubir.textContent = "Subir Archivo";
        btnSubir.disabled = false;
    }
});

window.eliminarMedia = async function(id, tabla) {
    if (confirm("¿Estás seguro de eliminar este archivo?")) {
        const { error } = await supabase.from(tabla).delete().eq('id', id);
        if (!error) cargarMultimediaAdmin();
        else alert("Error al eliminar el archivo.");
    }
};

document.getElementById('reciboForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cliente = document.getElementById('reciboCliente').value;
    const monto = parseFloat(document.getElementById('reciboMonto').value);
    const detalle = document.getElementById('reciboDetalle').value;
    const fechaEmision = new Date().toLocaleDateString('es-AR');

    const { error } = await supabase.from('recibos').insert([{ cliente, monto, detalle, fecha: fechaEmision }]);

    if (error) {
        const { error: error2 } = await supabase.from('recibos').insert([{ cliente, monto, detalle }]);
        if (error2) {
            alert("Error al crear recibo: " + error2.message);
            return;
        }
    }

    alert("¡Recibo creado con éxito!");
    document.getElementById('reciboForm').reset();
    cargarDatosAdmin();
});

window.verRecibo = function(cliente, monto, detalle, id, fechaRecibo) {
    const fechaFinal = (fechaRecibo && fechaRecibo !== 'undefined') ? fechaRecibo : new Date().toLocaleDateString('es-AR');
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
                .logo-fallback { font-size: 1.4rem; font-weight: 900; color: #121212; letter-spacing: 1px; margin-bottom: 5px; }
                .logo-fallback span { color: #ffc107; background: #121212; padding: 2px 8px; border-radius: 4px; }
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
                    <div class="logo-fallback">LEITMIX<span>PRODUCCIONES</span></div>
                    <div class="sub-title">Comprobante de Pago Oficial</div>
                </div>

                <div class="receipt-meta">
                    <div><span>N° Recibo:</span> <b>#000${id}</b></div>
                    <div><span>Fecha:</span> <b>${fechaFinal}</b></div>
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
                    <a href="https://api.whatsapp.com/send?text=Hola%20*${encodeURIComponent(cliente)}*,%20te%20env%C3%ADo%20el%20comprobante%20oficial%20de%20Leitmix%20Producciones.%0A%0A*Recibo%20N%C2%B0:*%20%23000${id}%0A*Fecha:*%20${fechaFinal}%0A*Concepto:*%20${encodeURIComponent(detalle)}%0A*Monto:*%20%24${Number(monto).toLocaleString('es-AR')}%0A%0A%C2%A1Muchas%20gracias%20por%20confiar%20en%20nosotros!" target="_blank" class="btn-whatsapp">
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
    ventanaRecibo.document.close();
};
