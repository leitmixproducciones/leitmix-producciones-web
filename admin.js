import { supabase } from "./supabase.js";

// CAPTURADOR DE ERRORES: Muestra un cartel en pantalla si algo falla en el celular
window.onerror = function (msg, url, line) {
  alert("⚠️ Error en el sistema:\n" + msg + "\nLínea: " + line);
};

// ======================
// SESIÓN DE USUARIO
// ======================
const botonCerrarSesion = document.getElementById("cerrarSesion");

if (botonCerrarSesion) {
  botonCerrarSesion.onclick = async () => {
    await supabase.auth.signOut();
    window.location.href = "login.html";
  };
}

const { data: sesion } = await supabase.auth.getSession();

if (!sesion || !sesion.session) {
  window.location.href = "login.html";
  throw new Error("Sin sesión activa");
}

const usuario = sesion.session.user;

// ======================
// TOGGLE CONFIGURACIÓN
// ======================
const btnToggleConfig = document.getElementById("btnToggleConfig");
const seccionConfiguracion = document.getElementById("seccionConfiguracion");

if (btnToggleConfig && seccionConfiguracion) {
  btnToggleConfig.onclick = () => {
    const estaOculto = seccionConfiguracion.classList.contains("oculto");
    if (estaOculto) {
      seccionConfiguracion.classList.remove("oculto");
      btnToggleConfig.innerText = "⚙️ Ocultar Configuración del Negocio ▲";
    } else {
      seccionConfiguracion.classList.add("oculto");
      btnToggleConfig.innerText = "⚙️ Mostrar Configuración del Negocio ▼";
    }
  };
}

// ======================
// DASHBOARD
// ======================
async function cargarResumenNegocio() {
  try {
    const { data: reservas } = await supabase.from("reservas").select("*").eq("user_id", usuario.id);
    const { data: recibos } = await supabase.from("recibos").select("importe, total, saldo_pendiente").eq("user_id", usuario.id);

    let totalReservas = 0;
    let confirmadas = 0;
    let pendientes = 0;
    let proximoEventoStr = "Sin eventos próximos";
    let eventosSemana = 0;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const dentroDeSieteDias = new Date(hoy);
    dentroDeSieteDias.setDate(hoy.getDate() + 7);

    const anioActual = new Date().getFullYear();
    const nombresMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const reservasPorMes = Array(12).fill(0);
    const serviciosContador = {};

    if (reservas && reservas.length > 0) {
      totalReservas = reservas.length;
      confirmadas = reservas.filter(r => r.estado === "Confirmada" || r.estado === "Confirmado").length;
      pendientes = reservas.filter(r => !r.estado || r.estado === "Pendiente").length;

      const fechasFuturas = [];

      reservas.forEach(r => {
        const servicio = r.evento || r.tipo_evento || "Sin Especificar";
        serviciosContador[servicio] = (serviciosContador[servicio] || 0) + 1;

        let fechaObj = null;
        if (r.fecha) {
          const partes = r.fecha.split("-");
          if (partes.length === 3) fechaObj = new Date(partes[0], partes[1] - 1, partes[2]);
        } else if (r.created_at) {
          fechaObj = new Date(r.created_at);
        }

        if (fechaObj) {
          if (fechaObj.getFullYear() === anioActual) reservasPorMes[fechaObj.getMonth()] += 1;
          if ((r.estado === "Confirmada" || r.estado === "Confirmado") && fechaObj >= hoy) {
            fechasFuturas.push({ ...r, fechaObj });
          }
        }
      });

      fechasFuturas.sort((a, b) => a.fechaObj - b.fechaObj);

      if (fechasFuturas.length > 0) {
        const prox = fechasFuturas[0];
        const dia = String(prox.fechaObj.getDate()).padStart(2, "0");
        const mes = String(prox.fechaObj.getMonth() + 1).padStart(2, "0");
        proximoEventoStr = `<b>${dia}/${mes}</b> - ${prox.nombre || prox.evento || 'Evento'}`;
      }

      eventosSemana = fechasFuturas.filter(r => r.fechaObj >= hoy && r.fechaObj <= dentroDeSieteDias).length;
    }

    const totalPendienteCobro = recibos ? recibos.reduce((sum, r) => sum + Number(r.saldo_pendiente || 0), 0) : 0;

    if (document.getElementById("totalReservasDash")) document.getElementById("totalReservasDash").innerText = totalReservas;
    if (document.getElementById("pendientesDash")) document.getElementById("pendientesDash").innerText = pendientes;
    if (document.getElementById("confirmadasDash")) document.getElementById("confirmadasDash").innerText = confirmadas;
    if (document.getElementById("dashProximoEvento")) document.getElementById("dashProximoEvento").innerHTML = proximoEventoStr;
    if (document.getElementById("dashEventosSemana")) document.getElementById("dashEventosSemana").innerText = eventosSemana;
    if (document.getElementById("dashPendienteCobro")) document.getElementById("dashPendienteCobro").innerText = "$" + totalPendienteCobro.toLocaleString("es-AR");

    const maxReservasMes = Math.max(...reservasPorMes, 1);
    const contGrafico = document.getElementById("graficoReservasMes");

    if (contGrafico) {
      contGrafico.innerHTML = nombresMeses.map((mes, idx) => {
        const cantidad = reservasPorMes[idx];
        const porcentaje = (cantidad / maxReservasMes) * 100;
        return `
          <div style="display: flex; align-items: center; gap: 10px; font-size: 13px; color: #fff; margin-bottom: 4px;">
            <span style="width: 35px; font-weight: bold;">${mes}</span>
            <div style="flex: 1; background: #222; height: 10px; border-radius: 5px; overflow: hidden;">
              <div style="width: ${porcentaje}%; background: #f5b400; height: 100%;"></div>
            </div>
            <span style="width: 25px; text-align: right; font-weight: bold; color: #f5b400;">${cantidad}</span>
          </div>
        `;
      }).join("");
    }

    const contServicios = document.getElementById("dashServiciosPopulares");
    if (contServicios) {
      const serviciosOrdenados = Object.entries(serviciosContador).sort((a, b) => b[1] - a[1]);
      if (serviciosOrdenados.length === 0) {
        contServicios.innerHTML = `<li style="color: #888; font-size: 14px;">No hay registros de servicios aún.</li>`;
      } else {
        contServicios.innerHTML = serviciosOrdenados.map(([servicio, cantidad]) => `
          <li style="display: flex; justify-content: space-between; align-items: center; background: #1a1a1a; padding: 8px 12px; border-radius: 6px; color: #fff; margin-bottom: 6px; border: 1px solid #2a2a2a;">
            <span style="font-size: 14px;">${servicio}</span>
            <span style="background: #f5b400; color: #000; padding: 2px 8px; border-radius: 12px; font-weight: bold; font-size: 12px;">${cantidad}</span>
          </li>
        `).join("");
      }
    }
  } catch (err) {
    console.error("Error en Resumen:", err);
  }
}

// ======================
// CONFIGURACIÓN
// ======================
async function cargarConfiguracion() {
  try {
    let linkPublico = `${window.location.origin}/index.html?dj=${usuario.id}`;

    const { data } = await supabase.from("configuracion").select("*").eq("user_id", usuario.id).maybeSingle();

    if (data) {
      if (document.getElementById("configNombre")) document.getElementById("configNombre").value = data.nombre_fantasia || data.nombre_negocio || data.nombre || "";
      if (document.getElementById("configSubtitulo")) document.getElementById("configSubtitulo").value = data.subtitulo || "";
      if (document.getElementById("configWhatsapp")) document.getElementById("configWhatsapp").value = data.telefono_whatsapp || data.whatsapp || "";
      if (document.getElementById("configAlias")) document.getElementById("configAlias").value = data.alias_pago || "";
      if (document.getElementById("configInstagram")) document.getElementById("configInstagram").value = data.instagram_url || data.instagram || "";
      if (document.getElementById("configTiktok")) document.getElementById("configTiktok").value = data.tiktok_url || "";
      if (document.getElementById("configYoutube")) document.getElementById("configYoutube").value = data.youtube_url || "";
    }

    const elemLink = document.getElementById("textoLinkPublico");
    if (elemLink) elemLink.textContent = linkPublico;

    const btnCopiar = document.getElementById("copiarLinkPublico");
    if (btnCopiar) {
      btnCopiar.onclick = () => {
        navigator.clipboard.writeText(linkPublico);
        alert("¡Enlace copiado al portapapeles!");
      };
    }
  } catch (err) {
    console.error("Error en Configuración:", err);
  }
}

const botonConfiguracion = document.getElementById("guardarConfiguracion");
if (botonConfiguracion) {
  botonConfiguracion.onclick = async () => {
    botonConfiguracion.disabled = true;
    botonConfiguracion.innerText = "⏳ Guardando...";

    const configuracion = {
      user_id: usuario.id,
      nombre_fantasia: document.getElementById("configNombre")?.value.trim() || null,
      subtitulo: document.getElementById("configSubtitulo")?.value.trim() || null,
      telefono_whatsapp: document.getElementById("configWhatsapp")?.value.trim() || null,
      alias_pago: document.getElementById("configAlias")?.value.trim() || null,
      instagram_url: document.getElementById("configInstagram")?.value.trim() || null,
      tiktok_url: document.getElementById("configTiktok")?.value.trim() || null,
      youtube_url: document.getElementById("configYoutube")?.value.trim() || null,
      nombre_negocio: document.getElementById("configNombre")?.value.trim() || null,
      whatsapp: document.getElementById("configWhatsapp")?.value.trim() || null,
      instagram: document.getElementById("configInstagram")?.value.trim() || null
    };

    const { error } = await supabase.from("configuracion").upsert(configuracion, { onConflict: "user_id" });

    botonConfiguracion.disabled = false;
    botonConfiguracion.innerText = "Guardar configuración";

    if (error) return alert("Error al guardar: " + error.message);
    alert("¡Configuración guardada correctamente!");
    cargarConfiguracion();
  };
}

// ======================
// LOGO
// ======================
async function cargarLogo() {
  try {
    const { data } = await supabase.from("configuracion").select("logo").eq("user_id", usuario.id).maybeSingle();
    if (data && data.logo) {
      const logo = document.getElementById("logoNegocio");
      if (logo) logo.src = data.logo;
    }
  } catch (err) {
    console.error("Error cargando Logo:", err);
  }
}

const botonLogo = document.getElementById("guardarLogo");
if (botonLogo) {
  botonLogo.onclick = async () => {
    const archivo = document.getElementById("configLogo")?.files[0];
    if (!archivo) return alert("Elegí un logo");

    const nombreArchivo = `logo-${usuario.id}-${Date.now()}-${archivo.name}`;
    const { error } = await supabase.storage.from("Media").upload(`logo/${nombreArchivo}`, archivo);
    if (error) return alert(error.message);

    const { data } = supabase.storage.from("Media").getPublicUrl(`logo/${nombreArchivo}`);
    const { error: updateError } = await supabase.from("configuracion").upsert({ user_id: usuario.id, logo: data.publicUrl }, { onConflict: "user_id" });

    if (updateError) return alert(updateError.message);
    alert("Logo guardado correctamente");
    cargarLogo();
  };
}

// ======================
// GALERÍA Y MEDIA
// ======================
const archivoImagen = document.getElementById("imagenArchivo");
const tituloImagen = document.getElementById("imagenTitulo");
const botonImagen = document.getElementById("guardarImagen");

if (botonImagen) {
  botonImagen.onclick = async () => {
    const archivo = archivoImagen?.files[0];
    if (!archivo) return alert("Elegí una imagen");

    const nombreArchivo = `${Date.now()}-${archivo.name}`;
    const { error } = await supabase.storage.from("Media").upload(`imagenes/${usuario.id}/${nombreArchivo}`, archivo);
    if (error) return alert(error.message);

    const { data } = supabase.storage.from("Media").getPublicUrl(`imagenes/${usuario.id}/${nombreArchivo}`);
    const { error: errorDB } = await supabase.from("galeria").insert([{ user_id: usuario.id, Imagen: data.publicUrl, Titulo: tituloImagen?.value || "" }]);

    if (errorDB) return alert(errorDB.message);
    alert("Imagen subida correctamente");
    if (archivoImagen) archivoImagen.value = "";
    if (tituloImagen) tituloImagen.value = "";
    cargarImagenes();
  };
}

async function cargarImagenes() {
  try {
    const lista = document.getElementById("listaImagenes");
    if (!lista) return;

    const { data, error } = await supabase.from("galeria").select("*").eq("user_id", usuario.id).order("id", { ascending: false });
    if (error) return;

    lista.innerHTML = "";
    data.forEach(imagen => {
      lista.innerHTML += `
        <div class="item" style="background:#222; padding:8px; border-radius:8px; margin-top:10px; display:inline-block; margin-right:10px;">
          <img src="${imagen.Imagen}" style="max-width:120px; display:block; border-radius:8px;">
          <p style="font-size:12px; margin:5px 0; color:#fff;">${imagen.Titulo || ""}</p>
          <button onclick="window.borrarImagen(${imagen.id})" style="background:#e74c3c; color:white; border:none; padding:6px 12px; font-size:12px; border-radius:6px; cursor:pointer;">Borrar</button>
        </div>
      `;
    });
  } catch (err) {
    console.error("Error cargando Imágenes:", err);
  }
}

window.borrarImagen = async function(id) {
  if (!confirm("¿Borrar imagen?")) return;
  const { error } = await supabase.from("galeria").delete().eq("id", id).eq("user_id", usuario.id);
  if (error) return alert(error.message);
  cargarImagenes();
};

// ======================
// VIDEOS
// ======================
const archivoVideo = document.getElementById("videoArchivo");
const tituloVideo = document.getElementById("videoTitulo");
const botonVideo = document.getElementById("guardarVideo");

if (botonVideo) {
  botonVideo.onclick = async () => {
    const archivo = archivoVideo?.files[0];
    if (!archivo) return alert("Elegí un video");

    const nombreArchivo = `${Date.now()}-${archivo.name}`;
    const { error } = await supabase.storage.from("Media").upload(`videos/${usuario.id}/${nombreArchivo}`, archivo);
    if (error) return alert(error.message);

    const { data } = supabase.storage.from("Media").getPublicUrl(`videos/${usuario.id}/${nombreArchivo}`);
    const { error: errorDB } = await supabase.from("videos").insert([{ user_id: usuario.id, Titulo: tituloVideo?.value || "", Url: data.publicUrl }]);

    if (errorDB) return alert(errorDB.message);
    alert("Video subido correctamente");
    if (archivoVideo) archivoVideo.value = "";
    if (tituloVideo) tituloVideo.value = "";
    cargarVideos();
  };
}

async function cargarVideos() {
  try {
    const lista = document.getElementById("listaVideos");
    if (!lista) return;

    const { data, error } = await supabase.from("videos").select("*").eq("user_id", usuario.id).order("id", { ascending: false });
    if (error) return;

    lista.innerHTML = "";
    data.forEach(video => {
      lista.innerHTML += `
        <div class="item" style="background:#222; padding:10px; border-radius:8px; margin-bottom:8px;">
          <p style="margin:0 0 5px 0; color:#fff;">${video.Titulo || ""}</p>
          <video controls style="max-width:100%; height:150px; border-radius:8px;"><source src="${video.Url}"></video>
          <button onclick="window.borrarVideo(${video.id})" style="background:#e74c3c; color:white; border:none; padding:6px 12px; font-size:12px; border-radius:6px; cursor:pointer; display:block; margin-top:5px;">Borrar</button>
        </div>
      `;
    });
  } catch (err) {
    console.error("Error cargando Videos:", err);
  }
}

window.borrarVideo = async function(id) {
  if (!confirm("¿Borrar video?")) return;
  const { error } = await supabase.from("videos").delete().eq("id", id).eq("user_id", usuario.id);
  if (error) return alert(error.message);
  cargarVideos();
};

// ======================
// TESTIMONIOS
// ======================
async function cargarTestimonios() {
  try {
    const lista = document.getElementById("listaTestimonios");
    if (!lista) return;

    const { data, error } = await supabase.from("testimonios").select("*").eq("user_id", usuario.id).order("id", { ascending: false });
    if (error) return;

    lista.innerHTML = "";
    data.forEach(testimonio => {
      lista.innerHTML += `
        <div class="item" style="background:#222; padding:10px; border-radius:8px; margin-bottom:10px;">
          <h3 style="margin:0; font-size:15px; color:#f5b400;">${testimonio.nombre}</h3>
          <p style="margin:2px 0; font-size:12px; color:#aaa;">${testimonio.evento || ""}</p>
          <p style="margin:5px 0; font-size:13px; color:#fff;">"${testimonio.comentario}"</p>
          <p style="font-size:12px; color:#fff;">Estado: ${testimonio.aprobado ? "✅ Publicado" : "⏳ Pendiente"}</p>
          ${!testimonio.aprobado ? `<button onclick="window.aprobarTestimonio(${testimonio.id})" style="font-size:11px; padding:4px 8px; margin-bottom:5px;">✅ Aprobar</button>` : ""}
          <button onclick="window.borrarTestimonio(${testimonio.id})" style="background:#e74c3c; color:white; border:none; padding:6px 12px; font-size:12px; border-radius:6px; cursor:pointer;">🗑️ Borrar</button>
        </div>
      `;
    });
  } catch (err) {
    console.error("Error en Testimonios:", err);
  }
}

window.aprobarTestimonio = async function(id) {
  const { error } = await supabase.from("testimonios").update({ aprobado: true }).eq("id", id).eq("user_id", usuario.id);
  if (error) return alert(error.message);
  alert("Testimonio publicado");
  cargarTestimonios();
};

window.borrarTestimonio = async function(id) {
  if (!confirm("¿Borrar testimonio?")) return;
  const { error } = await supabase.from("testimonios").delete().eq("id", id).eq("user_id", usuario.id);
  if (error) return alert(error.message);
  alert("Testimonio eliminado");
  cargarTestimonios();
};

// ======================
// RESERVAS
// ======================
async function cargarReservas() {
  try {
    const lista = document.getElementById("listaReservas");
    if (!lista) return;

    const { data, error } = await supabase.from("reservas").select("*").eq("user_id", usuario.id).order("id", { ascending: false });
    if (error) return;

    lista.innerHTML = "";
    data.forEach(reserva => {
      lista.innerHTML += `
        <div class="item" style="background:#1e1e1e; padding:15px; border-radius:8px; margin-bottom:12px; border:1px solid #333; color:#fff;">
          <h3 style="margin:0; color:#f5b400;">${reserva.nombre}</h3>
          <p style="margin:4px 0; font-size:13px;">📞 ${reserva.telefono} | 📍 ${reserva.localidad || ''}</p>
          <p style="margin:4px 0; font-size:13px;">🎉 Evento: ${reserva.evento || ''} | 📅 Fecha: ${reserva.fecha || ''}</p>
          <p style="margin:4px 0; font-size:13px;">📝 ${reserva.comentarios || ""}</p>
          <p style="margin:4px 0; font-size:13px; font-weight:bold;">Estado: ${reserva.estado || "Pendiente"}</p>

          <div style="margin: 12px 0; background: #111; padding: 12px; border-radius: 8px; font-size: 13px; border: 1px solid #f5b400; text-align: left;">
            <strong style="color: #f5b400; font-size: 14px; display: block; margin-bottom: 8px; border-bottom: 1px solid #333; padding-bottom: 4px;">
              🎧 HOJA DE RUTA DEL EVENTO
            </strong>
            <p style="margin: 6px 0; white-space: pre-line;"><strong>⏰ Cronograma:</strong><br>${reserva.cronograma || 'A definir'}</p>
            <p style="margin: 6px 0; white-space: pre-line;"><strong>🔥 Infaltables:</strong><br>${reserva.playlist_infaltables || 'A definir'}</p>
            <p style="margin: 6px 0; white-space: pre-line;"><strong>🚫 Prohibidos:</strong><br>${reserva.playlist_prohibidos || 'Sin restricciones'}</p>
          </div>

          <button onclick="window.confirmarReserva(${reserva.id})" style="font-size:12px; padding:6px 12px; margin-right:5px;">Confirmar</button>
          <button onclick="window.emitirRecibo(${reserva.id})" style="font-size:12px; padding:6px 12px; margin-right:5px;">🧾 Emitir recibo</button>
          <button onclick="window.borrarReserva(${reserva.id})" style="background:#e74c3c; color:white; border:none; padding:6px 12px; font-size:12px; border-radius:6px; cursor:pointer;">Borrar</button>
        </div>
      `;
    });
  } catch (err) {
    console.error("Error en Reservas:", err);
  }
}

window.confirmarReserva = async function(id) {
  const { error } = await supabase.from("reservas").update({ estado: "Confirmada" }).eq("id", id).eq("user_id", usuario.id);
  if (error) return alert(error.message);
  alert("Reserva confirmada");
  cargarReservas();
};

window.borrarReserva = async function(id) {
  if (!confirm("¿Borrar reserva?")) return;
  const { error } = await supabase.from("reservas").delete().eq("id", id).eq("user_id", usuario.id);
  if (error) return alert(error.message);
  alert("Reserva borrada");
  cargarReservas();
};

// ======================
// RECIBOS
// ======================
let reservaSeleccionada = null;

window.emitirRecibo = async function(id) {
  const { data, error } = await supabase.from("reservas").select("*").eq("id", id).eq("user_id", usuario.id).single();
  if (error) return alert(error.message);
  reservaSeleccionada = data;
  alert("Reserva de " + data.nombre + " seleccionada para generar recibo.");
};

const botonCrearRecibo = document.getElementById("crearRecibo");
if (botonCrearRecibo) {
  botonCrearRecibo.onclick = async () => {
    if (!reservaSeleccionada) return alert("Primero seleccioná una reserva de la lista");

    const total = Number(document.getElementById("reciboTotal")?.value || 0);
    const importe = Number(document.getElementById("reciboImporte")?.value || 0);
    if (!total || !importe) return alert("Completá los importes");

    const saldo_pendiente = total - importe;
    const numero = `REC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const { error } = await supabase.from("recibos").insert([{
      user_id: usuario.id,
      numero_recibo: numero,
      reserva_id: reservaSeleccionada.id,
      nombre: reservaSeleccionada.nombre,
      telefono: reservaSeleccionada.telefono,
      evento: reservaSeleccionada.evento,
      fecha_evento: reservaSeleccionada.fecha,
      total: total,
      importe: importe,
      concepto: document.getElementById("reciboConcepto")?.value || "",
      forma_pago: document.getElementById("reciboFormaPago")?.value || "",
      saldo_pendiente: saldo_pendiente,
      observaciones: document.getElementById("reciboObservaciones")?.value || "",
      fecha_pago: new Date()
    }]);

    if (error) return alert(error.message);
    alert("Recibo creado: " + numero);
    cargarRecibos();
  };
}

const botonReciboManual = document.getElementById("crearReciboManual");
if (botonReciboManual) {
  botonReciboManual.onclick = async () => {
    const nombre = document.getElementById("manualNombre")?.value;
    const telefono = document.getElementById("manualTelefono")?.value;
    const evento = document.getElementById("manualEvento")?.value;
    const fecha = document.getElementById("manualFecha")?.value;
    const total = Number(document.getElementById("manualTotal")?.value || 0);
    const importe = Number(document.getElementById("manualImporte")?.value || 0);

    if (!nombre || !evento || !total || !importe) return alert("Completá los datos obligatorios");

    const saldo_pendiente = total - importe;
    const numero = `REC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const { error } = await supabase.from("recibos").insert([{
      user_id: usuario.id,
      numero_recibo: numero,
      reserva_id: null,
      nombre: nombre,
      telefono: telefono,
      evento: evento,
      fecha_evento: fecha,
      total: total,
      importe: importe,
      concepto: document.getElementById("manualConcepto")?.value || "",
      forma_pago: document.getElementById("manualFormaPago")?.value || "",
      saldo_pendiente: saldo_pendiente,
      observaciones: document.getElementById("manualObservaciones")?.value || "",
      fecha_pago: new Date()
    }]);

    if (error) return alert(error.message);
    alert("Recibo manual creado: " + numero);
    cargarRecibos();
  };
}

async function cargarRecibos() {
  try {
    const lista = document.getElementById("listaRecibos");
    if (!lista) return;

    const { data, error } = await supabase.from("recibos").select("*").eq("user_id", usuario.id).order("id", { ascending: false });
    if (error) return;

    lista.innerHTML = "";
    data.forEach(recibo => {
      lista.innerHTML += `
        <div class="item" style="background:#222; padding:12px; border-radius:8px; margin-bottom:10px; color:#fff;">
          <h3 style="margin:0 0 5px 0; color:#f5b400;">🧾 ${recibo.numero_recibo}</h3>
          <p style="margin:2px 0; font-size:13px;">👤 Cliente: ${recibo.nombre} | 🎉 Evento: ${recibo.evento}</p>
          <p style="margin:2px 0; font-size:13px;">💰 Total: $${Number(recibo.total || 0).toLocaleString("es-AR")} | 💵 Recibido: $${Number(recibo.importe || 0).toLocaleString("es-AR")}</p>
          <p style="margin:2px 0; font-size:13px; font-weight:bold; color:#f5b400;">📌 Saldo Pendiente: $${Number(recibo.saldo_pendiente || 0).toLocaleString("es-AR")}</p>
          <p style="margin:2px 0; font-size:12px; color:#aaa;">📅 Fecha: ${new Date(recibo.fecha_pago).toLocaleDateString("es-AR")}</p>
          <p style="margin:5px 0;"><a href="recibo.html?id=${recibo.id}" target="_blank" style="color:#f5b400;">📄 Ver recibo</a></p>
          <button onclick="window.borrarRecibo(${recibo.id})" style="background:#e74c3c; color:white; border:none; padding:6px 12px; font-size:12px; border-radius:6px; cursor:pointer;">🗑️ Borrar</button>
        </div>
      `;
    });
  } catch (err) {
    console.error("Error en Recibos:", err);
  }
}

window.borrarRecibo = async function(id) {
  if (!confirm("¿Borrar este recibo?")) return;
  const { error } = await supabase.from("recibos").delete().eq("id", id).eq("user_id", usuario.id);
  if (error) return alert(error.message);
  alert("Recibo borrado correctamente");
  cargarRecibos();
};

// ======================
// INICIALIZACIÓN
// ======================
function inicializarPanel() {
  cargarConfiguracion();
  cargarLogo();
  cargarImagenes();
  cargarVideos();
  cargarTestimonios();
  cargarReservas();
  cargarRecibos();
  cargarResumenNegocio();
}

inicializarPanel();
