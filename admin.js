<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de Administración | Leitmix</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { background-color: #121212; color: #f1f1f1; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        .card { background: #1e1e1e; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
        h1, h2 { color: #ffc107; margin-bottom: 15px; font-size: 1.5rem; text-align: center; }
        input, select, button { width: 100%; padding: 12px; margin-bottom: 12px; border-radius: 8px; border: none; font-size: 1rem; }
        input, select { background: #2a2a2a; color: #fff; border: 1px solid #444; }
        button, .btn-main { background: #ffc107; color: #121212; font-weight: bold; cursor: pointer; transition: background 0.3s; }
        button:hover, .btn-main:hover { background: #e0a800; }
        .btn-danger { background: #dc3545; color: #fff; }
        .btn-danger:hover { background: #c82333; }
        .hidden { display: none !important; }
        .error-msg { color: #ff6b6b; text-align: center; margin-bottom: 10px; font-size: 0.9rem; }
        .stats-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
        .stat-box { background: #2a2a2a; padding: 15px; border-radius: 8px; text-align: center; }
        .stat-box h3 { font-size: 1.8rem; color: #ffc107; margin-top: 5px; }
        .media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; margin-top: 15px; }
    </style>
</head>
<body>

    <div class="container">
        <!-- Sección de Login -->
        <div id="loginSection" class="card">
            <h2>🎧 Iniciar Sesión</h2>
            <div id="loginError" class="error-msg"></div>
            <form id="loginForm">
                <input type="email" id="email" placeholder="Correo electrónico" required>
                <input type="password" id="password" placeholder="Contraseña" required>
                <button type="submit">Ingresar</button>
            </form>
        </div>

        <!-- Panel de Control (Privado) -->
        <div id="adminSection" class="card hidden">
            <h1>Panel de Control</h1>
            <button id="btnLogout" class="btn-danger">Cerrar sesión</button>

            <!-- 1. Resumen de Actividad -->
            <div style="margin-top: 20px;">
                <h2>📊 Resumen de Actividad</h2>
                <div class="stats-grid">
                    <div class="stat-box">
                        <p>Total de Reservas Recibidas</p>
                        <h3 id="totalReservas">0</h3>
                    </div>
                </div>
            </div>

            <hr style="border-color:#333; margin: 25px 0;">

            <!-- 2. EMITIR RECIBOS DE PAGO (NUEVO) -->
            <div>
                <h2>🧾 Emitir Recibo de Pago</h2>
                <form id="formRecibo">
                    <select id="reciboReservaId">
                        <option value="">-- Seleccionar Reserva Vincular (Opcional) --</option>
                    </select>
                    <input type="text" id="reciboNombre" placeholder="Nombre del Cliente" required>
                    <input type="text" id="reciboEvento" placeholder="Tipo de Evento (Ej: Casamiento / 15 Años)">
                    <input type="number" id="reciboTotal" placeholder="Precio Total ($)" required>
                    <input type="number" id="reciboSena" placeholder="Seña / Importe Abonado ($)" required>
                    <input type="text" id="reciboConcepto" placeholder="Concepto (Ej: Seña inicial)">
                    <button type="submit" class="btn-main">Generar y Guardar Recibo</button>
                </form>

                <h3 style="color:#fff; margin: 20px 0 10px 0; font-size:1.1rem;">Recibos Emitidos</h3>
                <div id="listaRecibosAdmin"></div>
            </div>

            <hr style="border-color:#333; margin: 25px 0;">

            <!-- 3. Gestión de Fotos -->
            <div>
                <h2>📸 Gestión de Fotos</h2>
                <input type="text" id="fotoTitulo" placeholder="Título de la foto (opcional)">
                <input type="file" id="fotoArchivo" accept="image/*">
                <button id="btnSubirFoto" class="btn-main">Subir Foto desde Galería</button>
                
                <div id="listaFotos" class="media-grid"></div>
            </div>

            <hr style="border-color:#333; margin: 25px 0;">

            <!-- 4. Gestión de Videos -->
            <div>
                <h2>🎬 Gestión de Videos</h2>
                <input type="text" id="videoTitulo" placeholder="Título del video (ej: Show en vivo)">
                <input type="file" id="videoArchivo" accept="video/*">
                <button id="btnSubirVideo" class="btn-main">Subir Video desde Galería</button>

                <div id="listaVideos" class="media-grid"></div>
            </div>
        </div>
    </div>

    <script type="module">
        import { supabase } from "./supabase.js";

        const loginSection = document.getElementById("loginSection");
        const adminSection = document.getElementById("adminSection");
        const loginForm = document.getElementById("loginForm");
        const loginError = document.getElementById("loginError");
        const btnLogout = document.getElementById("btnLogout");
        const totalReservasEl = document.getElementById("totalReservas");

        let usuario = null;

        async function checkSession() {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                usuario = session.user;
                mostrarPanel();
            } else {
                mostrarLogin();
            }
        }

        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            loginError.textContent = "";
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                loginError.textContent = "Error: " + error.message;
            } else {
                usuario = data.user;
                mostrarPanel();
            }
        });

        btnLogout.addEventListener("click", async () => {
            await supabase.auth.signOut();
            localStorage.clear();
            usuario = null;
            mostrarLogin();
        });

        function mostrarPanel() {
            loginSection.classList.add("hidden");
            adminSection.classList.remove("hidden");
            cargarDatosAdmin();
            cargarReservasEnSelect();
            cargarRecibos();
            cargarFotos();
            cargarVideos();
        }

        function mostrarLogin() {
            adminSection.classList.add("hidden");
            loginSection.classList.remove("hidden");
        }

        async function cargarDatosAdmin() {
            try {
                const { count, error } = await supabase
                    .from('reservas')
                    .select('*', { count: 'exact', head: true });

                if (!error) {
                    totalReservasEl.textContent = count || 0;
                }
            } catch (err) {
                console.log("Error al cargar datos:", err);
            }
        }

        // --- GESTIÓN DE RECIBOS ---
        async function cargarReservasEnSelect() {
            const select = document.getElementById("reciboReservaId");
            if (!select) return;

            const { data: reservas } = await supabase
                .from("reservas")
                .select("id, nombre, evento, fecha")
                .order("fecha", { ascending: false });

            if (!reservas) return;

            select.innerHTML = '<option value="">-- Seleccionar Reserva Vincular (Opcional) --</option>' + 
                reservas.map(r => `<option value="${r.id}">${r.nombre} - ${r.evento || 'Evento'} (${r.fecha})</option>`).join("");
        }

        document.getElementById("reciboReservaId")?.addEventListener("change", async (e) => {
            const reservaId = e.target.value;
            if (!reservaId) return;

            const { data } = await supabase.from("reservas").select("*").eq("id", reservaId).single();
            if (data) {
                document.getElementById("reciboNombre").value = data.nombre || "";
                document.getElementById("reciboEvento").value = data.evento || "";
            }
        });

        document.getElementById("formRecibo")?.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById("reciboNombre").value;
            const evento = document.getElementById("reciboEvento").value;
            const total = parseFloat(document.getElementById("reciboTotal").value) || 0;
            const sena = parseFloat(document.getElementById("reciboSena").value) || 0;
            const concepto = document.getElementById("reciboConcepto").value || "Seña de evento";
            const numRecibo = "REC-" + Math.floor(10000 + Math.random() * 90000);

            const { error } = await supabase.from("recibos").insert([{
                numero_recibo: numRecibo,
                nombre: nombre,
                evento: evento,
                total: total,
                sena: sena,
                concepto: concepto
            }]);

            if (error) {
                alert("Error al guardar recibo: " + error.message);
            } else {
                alert("¡Recibo generado con éxito!");
                document.getElementById("formRecibo").reset();
                cargarRecibos();
            }
        });

        async function cargarRecibos() {
            const cont = document.getElementById("listaRecibosAdmin");
            if (!cont) return;

            const { data: recibos, error } = await supabase.from("recibos").select("*").order("created_at", { ascending: false });

            if (error || !recibos || recibos.length === 0) {
                cont.innerHTML = "<p style='font-size:12px; color:#aaa; text-align:center;'>No hay recibos generados.</p>";
                return;
            }

            cont.innerHTML = recibos.map(r => {
                const total = parseFloat(r.total || 0);
                const sena = parseFloat(r.sena || 0);
                const restante = total - sena;
                const numRecibo = r.numero_recibo || `REC-${r.id}`;

                return `
                    <div style="background:#2a2a2a; padding:12px; border-radius:8px; margin-bottom:10px; border:1px solid #444;">
                        <strong style="color:#ffc107; font-size:1rem;">🧾 ${numRecibo} - ${r.nombre}</strong>
                        <p style="font-size:0.85rem; color:#ccc; margin:5px 0;">Total: $${total} | Abonado: $${sena} | <b style="color:#ff6b6b;">Debe: $${restante}</b></p>
                        <div style="display:flex; gap:8px; margin-top:8px;">
                            <button onclick="window.generarImagenRecibo('${r.nombre}', '${r.evento || 'Evento'}', '${numRecibo}', ${total}, ${sena}, '${r.concepto || 'Seña'}')" style="padding:6px; font-size:0.8rem;">👁️ Ver Recibo</button>
                            <button onclick="window.borrarRecibo('${r.id}')" class="btn-danger" style="padding:6px; font-size:0.8rem; width:auto;">Borrar</button>
                        </div>
                    </div>
                `;
            }).join("");
        }

        window.borrarRecibo = async (id) => {
            if (confirm("¿Borrar este recibo?")) {
                await supabase.from("recibos").delete().eq("id", id);
                cargarRecibos();
            }
        };

        window.generarImagenRecibo = function(nombre, evento, numeroRecibo, total, sena, concepto) {
            const restante = total - sena;
            const fechaHoy = new Date().toLocaleDateString('es-AR');

            const contenidoHTML = `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Recibo ${numeroRecibo}</title>
                    <style>
                        body { font-family: Arial, sans-serif; background: #121212; color: #333; padding: 20px; display: flex; justify-content: center; }
                        .recibo-card { background: #fff; width: 340px; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); border-top: 8px solid #ffc107; text-align: center; }
                        .logo { font-size: 1.3rem; font-weight: bold; color: #121212; margin-bottom: 2px; }
                        .sub { font-size: 0.8rem; color: #666; margin-bottom: 15px; }
                        .numero { font-size: 0.9rem; font-weight: bold; background: #eee; padding: 6px 12px; border-radius: 4px; display: inline-block; margin-bottom: 15px; }
                        .detalles { text-align: left; font-size: 0.9rem; border-top: 1px dashed #ccc; border-bottom: 1px dashed #ccc; padding: 12px 0; margin-bottom: 15px; line-height: 1.6; }
                        .monto-box { background: #fff8e1; border: 1px solid #ffe082; padding: 10px; border-radius: 6px; font-weight: bold; font-size: 1.1rem; color: #856404; margin-bottom: 15px; }
                        .btn-imprimir { background: #28a745; color: #fff; border: none; padding: 10px 18px; font-weight: bold; border-radius: 5px; cursor: pointer; margin-top: 10px; font-size: 0.9rem; }
                        @media print { .btn-imprimir { display: none; } body { background: white; padding: 0; } }
                    </style>
                </head>
                <body>
                    <div class="recibo-card">
                        <div class="logo">🎵 LEITMIX PRODUCCIONES</div>
                        <div class="sub">Sonido, Iluminación y DJs</div>
                        <div class="numero">COMPROBANTE: ${numeroRecibo}</div>
                        
                        <div class="detalles">
                            <b>Fecha:</b> ${fechaHoy}<br>
                            <b>Cliente:</b> ${nombre}<br>
                            <b>Evento:</b> ${evento}<br>
                            <b>Concepto:</b> ${concepto}
                        </div>

                        <div class="monto-box">
                            Abonado / Seña: $${sena}
                        </div>

                        <div class="detalles" style="border: none; padding: 0; margin-bottom: 10px;">
                            <b>Precio Total:</b> $${total}<br>
                            <b style="color: ${restante > 0 ? '#d9534f' : '#28a745'};">Saldo Pendiente: $${restante}</b>
                        </div>

                        <button class="btn-imprimir" onclick="window.print()">🖨️ Guardar PDF / Imprimir</button>
                    </div>
                </body>
                </html>
            `;

            const ventana = window.open('', '_blank');
            ventana.document.write(contenidoHTML);
            ventana.document.close();
        };

        // --- SUBIR FOTOS ---
        const btnSubirFoto = document.getElementById("btnSubirFoto");
        if (btnSubirFoto) {
            btnSubirFoto.onclick = async () => {
                const archivoInput = document.getElementById("fotoArchivo");
                const tituloInput = document.getElementById("fotoTitulo");

                if (!archivoInput || !archivoInput.files[0]) return alert("Seleccioná una foto primero.");
                const archivo = archivoInput.files[0];
                const titulo = tituloInput ? tituloInput.value : "Sin título";

                btnSubirFoto.disabled = true;
                btnSubirFoto.innerText = "Subiendo foto...";

                try {
                    const path = `galeria/${usuario ? usuario.id : 'general'}/${Date.now()}-${archivo.name}`;
                    const { error: uploadError } = await supabase.storage.from("Media").upload(path, archivo);
                    if (uploadError) throw uploadError;

                    const { data: urlData } = supabase.storage.from("Media").getPublicUrl(path);
                    await supabase.from("galeria").insert([{ user_id: usuario ? usuario.id : null, Imagen: urlData.publicUrl, Titulo: titulo }]);

                    alert("¡Foto subida con éxito!");
                    if (tituloInput) tituloInput.value = "";
                    archivoInput.value = "";
                    cargarFotos();
                } catch (err) {
                    alert("Error al subir foto: " + err.message);
                } finally {
                    btnSubirFoto.disabled = false;
                    btnSubirFoto.innerText = "Subir Foto desde Galería";
                }
            };
        }

        async function cargarFotos() {
            const cont = document.getElementById("listaFotos");
            if (!cont) return;

            cont.innerHTML = "<p style='font-size:12px; color:#aaa; grid-column: 1/-1; text-align:center;'>Cargando fotos...</p>";
            let { data } = await supabase.from("galeria").select("*");

            if (!data || data.length === 0) {
                cont.innerHTML = "<p style='font-size:12px; color:#aaa; grid-column: 1/-1; text-align:center;'>No hay fotos subidas.</p>";
                return;
            }

            cont.innerHTML = "";
            data.forEach(img => {
                const imgUrl = img.Imagen || img.url || img.imagen || '';
                const imgTitulo = img.Titulo || img.titulo || 'Sin título';

                if (imgUrl) {
                    cont.innerHTML += `
                        <div style="background:#2a2a2a; padding:6px; border-radius:6px; text-align:center; border: 1px solid #444;">
                            <img src="${imgUrl}" style="width:100%; height:80px; object-fit:cover; border-radius:4px;" alt="Foto">
                            <p style="font-size:11px; margin:4px 0; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${imgTitulo}</p>
                            <button onclick="window.borrarFoto(${img.id})" class="btn-danger" style="margin-top:2px; font-size:10px; padding:4px 6px; width:100%;">Borrar</button>
                        </div>`;
                }
            });
        }

        window.borrarFoto = async (id) => {
            if (confirm("¿Borrar esta imagen?")) {
                const { error } = await supabase.from("galeria").delete().eq("id", id);
                if (error) alert("Error al borrar: " + error.message);
                else cargarFotos();
            }
        };

        // --- SUBIR VIDEOS ---
        const btnSubirVideo = document.getElementById("btnSubirVideo");
        if (btnSubirVideo) {
            btnSubirVideo.onclick = async () => {
                const archivoInput = document.getElementById("videoArchivo");
                const tituloInput = document.getElementById("videoTitulo");

                if (!archivoInput || !archivoInput.files[0]) return alert("Seleccioná un archivo de video primero.");
                const archivo = archivoInput.files[0];
                const titulo = tituloInput && tituloInput.value.trim() !== "" ? tituloInput.value : "Sin título";

                btnSubirVideo.disabled = true;
                btnSubirVideo.innerText = "Subiendo video... Aguardá un momento.";

                try {
                    const path = `videos/${usuario ? usuario.id : 'general'}/${Date.now()}-${archivo.name}`;
                    const { error: uploadError } = await supabase.storage.from("Media").upload(path, archivo);

                    if (uploadError) throw uploadError;

                    const { data: urlData } = supabase.storage.from("Media").getPublicUrl(path);

                    const { error: dbError } = await supabase.from("videos").insert([{ 
                        Titulo: titulo, 
                        Url: urlData.publicUrl, 
                        user_id: usuario ? usuario.id : null 
                    }]);

                    if (dbError) throw dbError;

                    alert("¡Video subido con éxito!");
                    if (tituloInput) tituloInput.value = "";
                    archivoInput.value = "";
                    cargarVideos();
                } catch (err) {
                    alert("Error al subir video: " + err.message);
                } finally {
                    btnSubirVideo.disabled = false;
                    btnSubirVideo.innerText = "Subir Video desde Galería";
                }
            };
        }

        async function cargarVideos() {
            const cont = document.getElementById("listaVideos");
            if (!cont) return;

            cont.innerHTML = "<p style='font-size:12px; color:#aaa; grid-column: 1/-1; text-align:center;'>Cargando videos...</p>";
            let { data } = await supabase.from("videos").select("*");

            if (!data || data.length === 0) {
                cont.innerHTML = "<p style='font-size:12px; color:#aaa; grid-column: 1/-1; text-align:center;'>No hay videos subidos.</p>";
                return;
            }

            cont.innerHTML = "";
            data.forEach(vid => {
                const vidUrl = vid.Url || vid.url || vid.Video || vid.video || '';
                const vidTitulo = vid.Titulo || vid.titulo || 'Sin título';

                if (vidUrl) {
                    cont.innerHTML += `
                        <div style="background:#2a2a2a; padding:6px; border-radius:6px; text-align:center; border: 1px solid #444;">
                            <video src="${vidUrl}" style="width:100%; height:80px; object-fit:cover; border-radius:4px;" controls preload="metadata"></video>
                            <p style="font-size:11px; margin:4px 0; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${vidTitulo}</p>
                            <button onclick="window.borrarVideo(${vid.id})" class="btn-danger" style="margin-top:2px; font-size:10px; padding:4px 6px; width:100%;">Borrar</button>
                        </div>`;
                }
            });
        }

        window.borrarVideo = async (id) => {
            if (confirm("¿Borrar este video?")) {
                const { error } = await supabase.from("videos").delete().eq("id", id);
                if (error) alert("Error al borrar: " + error.message);
                else cargarVideos();
            }
        };

        checkSession();
    </script>
</body>
</html>
