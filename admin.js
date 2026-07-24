import { supabase } from "./supabase.js";

// ======================
// SESIÓN DE USUARIO
// ======================
const botonCerrarSesion = document.getElementById("cerrarSesion");

if (botonCerrarSesion) {
  botonCerrarSesion.onclick = async () => {
    await supabase.auth.signOut();
    window.location.href = "/leitmix-producciones-web/admin/login.html";
  };
}

const { data: sesion } = await supabase.auth.getSession();

if (!sesion.session) {
  window.location.href = "/leitmix-producciones-web/admin/login.html";
  throw new Error("Sin sesión");
}

const usuario = sesion.session.user;

// ======================
// RESUMEN DEL NEGOCIO (DASHBOARD)
// ======================
async function cargarResumenNegocio() {
  const [{ data: reservas }, { data: testimonios }, { data: recibos }] = await Promise.all([
    supabase.from("reservas").select("estado").eq("user_id", usuario.id),
    supabase.from("testimonios").select("id").eq("user_id", usuario.id),
    supabase.from("recibos").select("importe").eq("user_id", usuario.id)
  ]);

  let confirmadas = 0;
  let pendientes = 0;

  if (reservas) {
    confirmadas = reservas.filter(r => r.estado === "Confirmada" || r.estado === "Confirmado").length;
    pendientes = reservas.filter(r => !r.estado || r.estado === "Pendiente").length;
  }

  const totalTestimonios = testimonios ? testimonios.length : 0;
  const totalRecaudado = recibos ? recibos.reduce((sum, r) => sum + Number(r.importe || 0), 0) : 0;

  const elemConfirmadas = document.getElementById("resumenFechasConfirmadas") || document.getElementById("resumenConfirmadas") || document.getElementById("fechasConfirmadas");
  const elemTestimonios = document.getElementById("resumenTestimonios") || document.getElementById("totalTestimonios");
  const elemPendientes = document.getElementById("resumenPendientes") || document.getElementById("fechasPendientes");
  const elemRecaudado = document.getElementById("resumenTotalRecaudado") || document.getElementById("totalRecaudado");

  if (elemConfirmadas) elemConfirmadas.innerText = confirmadas;
  if (elemTestimonios) elemTestimonios.innerText = totalTestimonios;
  if (elemPendientes) elemPendientes.innerText = pendientes;
  if (elemRecaudado) elemRecaudado.innerText = "$" + totalRecaudado.toLocaleString("es-AR");
}

// ======================
// CONFIGURACIÓN DEL NEGOCIO
// ======================
const botonConfiguracion = document.getElementById("guardarConfiguracion");

async function cargarConfiguracion() {
  // Configurar enlace de difusión pública con el ID del usuario
  const linkPublico = `${window.location.origin}/index.html?dj=${usuario.id}`;
  const elemLink = document.getElementById("textoLinkPublico");
  if (elemLink) elemLink.textContent = linkPublico;

  const btnCopiar = document.getElementById("copiarLinkPublico");
  if (btnCopiar) {
    btnCopiar.onclick = () => {
      navigator.clipboard.writeText(linkPublico);
      alert("¡Enlace copiado al portapapeles!");
    };
  }

  const { data, error } = await supabase
    .from("configuracion")
    .select("*")
    .eq("user_id", usuario.id)
    .maybeSingle();

  if (error) {
    console.log("Sin configuración todavía:", error.message);
    return;
  }

  if (data) {
    // Usamos fallback con || "" para evitar que aparezca 'null' en los inputs
    if (document.getElementById("configNombre")) {
      document.getElementById("configNombre").value = data.nombre_fantasia || data.nombre_negocio || data.nombre || "";
    }
    if (document.getElementById("configSubtitulo")) {
      document.getElementById("configSubtitulo").value = data.subtitulo || "";
    }
    if (document.getElementById("configWhatsapp")) {
      document.getElementById("configWhatsapp").value = data.telefono_whatsapp || data.whatsapp || "";
    }
    if (document.getElementById("configAlias")) {
      document.getElementById("configAlias").value = data.alias || data.alias_pago || "";
    }
    if (document.getElementById("configInstagram")) {
      document.getElementById("configInstagram").value = data.instagram_url || data.instagram || "";
    }
    if (document.getElementById("configTiktok")) {
      document.getElementById("configTiktok").value = data.tiktok_url || "";
    }
    if (document.getElementById("configYoutube")) {
      document.getElementById("configYoutube").value = data.youtube_url || "";
    }
  }
}

if (botonConfiguracion) {
  botonConfiguracion.onclick = async () => {
    const configuracion = {
      user_id: usuario.id,
      nombre_fantasia: document.getElementById("configNombre")?.value.trim() || null,
      subtitulo: document.getElementById("configSubtitulo")?.value.trim() || null,
      telefono_whatsapp: document.getElementById("configWhatsapp")?.value.trim() || null,
      alias: document.getElementById("configAlias")?.value.trim() || null,
      instagram_url: document.getElementById("configInstagram")?.value.trim() || null,
      tiktok_url: document.getElementById("configTiktok")?.value.trim() || null,
      youtube_url: document.getElementById("configYoutube")?.value.trim() || null,

      // Mantenemos compatibilidad con columnas anteriores si existieran
      nombre_negocio: document.getElementById("configNombre")?.value.trim() || null,
      whatsapp: document.getElementById("configWhatsapp")?.value.trim() || null,
      alias_pago: document.getElementById("configAlias")?.value.trim() || null,
      instagram: document.getElementById("configInstagram")?.value.trim() || null
    };

    const { error } = await supabase
      .from("configuracion")
      .upsert(configuracion, { onConflict: "user_id" });

    if (error) {
      alert("Error al guardar: " + error.message);
      return;
    }

    alert("Configuración guardada correctamente");
  };
}

cargarConfiguracion();

// ======================
// LOGO
// ======================
async function cargarLogo() {
  const { data, error } = await supabase
    .from("configuracion")
    .select("logo")
    .eq("user_id", usuario.id)
    .single();

  if (error) {
    console.log(error);
    return;
  }

  if (data && data.logo) {
    const logo = document.getElementById("logoNegocio");
    if (logo) logo.src = data.logo;
  }
}

cargarLogo();

const botonLogo = document.getElementById("guardarLogo");

if (botonLogo) {
  botonLogo.onclick = async () => {
    const archivo = document.getElementById("configLogo").files[0];
    if (!archivo) return alert("Elegí un logo");

    const nombreArchivo = `logo-${usuario.id}-${Date.now()}-${archivo.name}`;

    const { error } = await supabase.storage
      .from("Media")
      .upload(`logo/${nombreArchivo}`, archivo);

    if (error) return alert(error.message);

    const { data } = supabase.storage
      .from("Media")
      .getPublicUrl(`logo/${nombreArchivo}`);

    const { error: updateError } = await supabase
      .from("configuracion")
      .update({ logo: data.publicUrl })
      .eq("user_id", usuario.id);

    if (updateError) return alert(updateError.message);

    alert("Logo guardado correctamente");
  };
}

// ======================
// IMÁGENES (GALERÍA)
// ======================
const archivoImagen = document.getElementById("imagenArchivo");
const tituloImagen = document.getElementById("imagenTitulo");
const botonImagen = document.getElementById("guardarImagen");

if (botonImagen) {
  botonImagen.onclick = async () => {
    const archivo = archivoImagen.files[0];
    if (!archivo) return alert("Elegí una imagen");

    const nombreArchivo = `${Date.now()}-${archivo.name}`;

    const { error } = await supabase.storage
      .from("Media")
      .upload(`imagenes/${usuario.id}/${nombreArchivo}`, archivo);

    if (error) return alert(error.message);

    const { data } = supabase.storage
      .from("Media")
      .getPublicUrl(`imagenes/${usuario.id}/${nombreArchivo}`);

    const { error: errorDB } = await supabase
      .from("galeria")
      .insert([{
        user_id: usuario.id,
        Imagen: data.publicUrl,
        Titulo: tituloImagen.value
      }]);

    if (errorDB) return alert(errorDB.message);

    alert("Imagen subida correctamente");
    archivoImagen.value = "";
    tituloImagen.value = "";
    cargarImagenes();
  };
}

async function cargarImagenes() {
  const lista = document.getElementById("listaImagenes");
  if (!lista) return;

  const { data, error } = await supabase
    .from("galeria")
    .select("*")
    .eq("user_id", usuario.id)
    .order("id", { ascending: false });

  if (error) return console.log(error);

  lista.innerHTML = "";
  data.forEach(imagen => {
    lista.innerHTML += `
      <div class="item">
        <img src="${imagen.Imagen}">
        <p>${imagen.Titulo}</p>
        <button class="borrar" onclick="borrarImagen(${imagen.id})">Borrar</button>
      </div>
    `;
  });
}

window.borrarImagen = async function(id) {
  if (!confirm("¿Borrar imagen?")) return;

  const { error } = await supabase
    .from("galeria")
    .delete()
    .eq("id", id)
    .eq("user_id", usuario.id);

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
    const archivo = archivoVideo.files[0];
    if (!archivo) return alert("Elegí un video");

    const nombreArchivo = `${Date.now()}-${archivo.name}`;

    const { error } = await supabase.storage
      .from("Media")
      .upload(`videos/${usuario.id}/${nombreArchivo}`, archivo);

    if (error) return alert(error.message);

    const { data } = supabase.storage
      .from("Media")
      .getPublicUrl(`videos/${usuario.id}/${nombreArchivo}`);

    const { error: errorDB } = await supabase
      .from("videos")
      .insert([{
        user_id: usuario.id,
        Titulo: tituloVideo.value,
        Url: data.publicUrl
      }]);

    if (errorDB) return alert(errorDB.message);

    alert("Video subido correctamente");
    archivoVideo.value = "";
    tituloVideo.value = "";
    cargarVideos();
  };
}

async function cargarVideos() {
  const lista = document.getElementById("listaVideos");
  if (!lista) return;

  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("user_id", usuario.id)
    .order("id", { ascending: false });

  if (error) return console.log(error);

  lista.innerHTML = "";
  data.forEach(video => {
    lista.innerHTML += `
      <div class="item">
        <p>${video.Titulo}</p>
        <video controls><source src="${video.Url}"></video>
        <button class="borrar" onclick="borrarVideo(${video.id})">Borrar</button>
      </div>
    `;
  });
}

window.borrarVideo = async function(id) {
  if (!confirm("¿Borrar video?")) return;

  const { error } = await supabase
    .from("videos")
    .delete()
    .eq("id", id)
    .eq("user_id", usuario.id);

  if (error) return alert(error.message);
  cargarVideos();
};

// ======================
// TESTIMONIOS
// ======================
async function cargarTestimonios() {
  const lista = document.getElementById("listaTestimonios");
  if (!lista) return;

  const { data, error } = await supabase
    .from("testimonios")
    .select("*")
    .eq("user_id", usuario.id)
    .order("id", { ascending: false });

  if (error) return console.log(error);

  lista.innerHTML = "";
  data.forEach(testimonio => {
    lista.innerHTML += `
      <div class="item">
        <h3>${testimonio.nombre}</h3>
        <p>${testimonio.evento || ""}</p>
        <p>${testimonio.comentario}</p>
        <p>Estado: ${testimonio.aprobado ? "✅ Publicado" : "⏳ Pendiente"}</p>
        ${!testimonio.aprobado ? `<button onclick="aprobarTestimonio(${testimonio.id})">✅ Aprobar</button>` : ""}
        <button class="borrar" onclick="borrarTestimonio(${testimonio.id})">🗑️ Borrar</button>
      </div>
    `;
  });

  cargarResumenNegocio();
}

window.aprobarTestimonio = async function(id) {
  const { error } = await supabase
    .from("testimonios")
    .update({ aprobado: true })
    .eq("id", id)
    .eq("user_id", usuario.id);

  if (error) return alert(error.message);
  alert("Testimonio publicado");
  cargarTestimonios();
};

window.borrarTestimonio = async function(id) {
  if (!confirm("¿Borrar testimonio?")) return;

  const { error } = await supabase
    .from("testimonios")
    .delete()
    .eq("id", id)
    .eq("user_id", usuario.id);

  if (error) return alert(error.message);
  alert("Testimonio eliminado");
  cargarTestimonios();
};

// ======================
// RESERVAS & HOJA DE RUTA
// ======================
async function cargarReservas() {
  const lista = document.getElementById("listaReservas");
  if (!lista) return;

  const { data, error } = await supabase
    .from("reservas")
    .select("*")
    .eq("user_id", usuario.id)
    .order("id", { ascending: false });

  if (error) return console.log(error);

  lista.innerHTML = "";
  data.forEach(reserva => {
    lista.innerHTML += `
      <div class="item">
        <h3>${reserva.nombre}</h3>
        <p>📞 ${reserva.telefono}</p>
        <p>📍 ${reserva.localidad}</p>
        <p>🎉 Evento: ${reserva.evento}</p>
        <p>📅 Fecha: ${reserva.fecha}</p>
        <p>📝 ${reserva.comentarios || ""}</p>
        <p>Estado: ${reserva.estado || "Pendiente"}</p>

        <div style="margin: 12px 0; background: #111; padding: 12px; border-radius: 8px; font-size: 13px; border: 1px solid #f5b400; text-align: left;">
          <strong style="color: #f5b400; font-size: 14px; display: block; margin-bottom: 8px; border-bottom: 1px solid #333; padding-bottom: 4px;">
            🎧 HOJA DE RUTA DEL EVENTO
          </strong>
          <p style="margin: 6px 0; white-space: pre-line;"><strong>⏰ Cronograma & Momentos:</strong><br>${reserva.cronograma || 'A definir'}</p>
          <p style="margin: 6px 0; white-space: pre-line;"><strong>🔥 Tandas & Infaltables:</strong><br>${reserva.playlist_infaltables || 'A definir'}</p>
          <p style="margin: 6px 0; white-space: pre-line;"><strong>🚫 Prohibidos:</strong><br>${reserva.playlist_prohibidos || 'Sin restricciones'}</p>
        </div>

        <button onclick="confirmarReserva(${reserva.id})">Confirmar</button>
        <button onclick="emitirRecibo(${reserva.id})">🧾 Emitir recibo</button>
        <button class="borrar" onclick="borrarReserva(${reserva.id})">Borrar</button>
      </div>
    `;
  });

  cargarResumenNegocio();
}

window.confirmarReserva = async function(id) {
  const { error } = await supabase
    .from("reservas")
    .update({ estado: "Confirmada" })
    .eq("id", id)
    .eq("user_id", usuario.id);

  if (error) return alert(error.message);
  alert("Reserva confirmada");
  cargarReservas();
};

window.borrarReserva = async function(id) {
  if (!confirm("¿Borrar reserva?")) return;

  const { error } = await supabase
    .from("reservas")
    .delete()
    .eq("id", id)
    .eq("user_id", usuario.id);

  if (error) return alert(error.message);
  alert("Reserva borrada");
  cargarReservas();
};

// ======================
// RECIBOS
// ======================
let reservaSeleccionada = null;

window.emitirRecibo = async function(id) {
  const { data, error } = await supabase
    .from("reservas")
    .select("*")
    .eq("id", id)
    .eq("user_id", usuario.id)
    .single();

  if (error) return alert(error.message);

  reservaSeleccionada = data;

  const nombre = document.getElementById("reciboNombre");
  const evento = document.getElementById("reciboEvento");
  const fecha = document.getElementById("reciboFecha");

  if (nombre) nombre.value = data.nombre || "";
  if (evento) evento.value = data.evento || "";
  if (fecha) fecha.value = data.fecha || "";

  alert("Reserva cargada para recibo");
};

const botonCrearRecibo = document.getElementById("crearRecibo");

if (botonCrearRecibo) {
  botonCrearRecibo.onclick = async () => {
    if (!reservaSeleccionada) return alert("Primero seleccioná una reserva");

    const total = Number(document.getElementById("reciboTotal").value);
    const importe = Number(document.getElementById("reciboImporte").value);

    if (!total || !importe) return alert("Completá los importes");

    const saldo_pendiente = total - importe;
    const numero = `REC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const { error } = await supabase
      .from("recibos")
      .insert([{
        user_id: usuario.id,
        numero_recibo: numero,
        reserva_id: reservaSeleccionada.id,
        nombre: reservaSeleccionada.nombre,
        telefono: reservaSeleccionada.telefono,
        evento: reservaSeleccionada.evento,
        fecha_evento: reservaSeleccionada.fecha,
        total: total,
        importe: importe,
        concepto: document.getElementById("reciboConcepto").value,
        forma_pago: document.getElementById("reciboFormaPago").value,
        saldo_pendiente: saldo_pendiente,
        observaciones: document.getElementById("reciboObservaciones").value,
        fecha_pago: new Date()
      }]);

    if (error) return alert(error.message);

    alert("Recibo creado: " + numero);
    cargarRecibos();
  };
}

// RECIBO MANUAL
const botonReciboManual = document.getElementById("crearReciboManual");

if (botonReciboManual) {
  botonReciboManual.onclick = async () => {
    const nombre = document.getElementById("manualNombre").value;
    const telefono = document.getElementById("manualTelefono").value;
    const evento = document.getElementById("manualEvento").value;
    const fecha = document.getElementById("manualFecha").value;
    const total = Number(document.getElementById("manualTotal").value);
    const importe = Number(document.getElementById("manualImporte").value);

    if (!nombre || !evento || !total || !importe) {
      return alert("Completá los datos obligatorios");
    }

    const saldo_pendiente = total - importe;
    const numero = `REC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const { error } = await supabase
      .from("recibos")
      .insert([{
        user_id: usuario.id,
        numero_recibo: numero,
        reserva_id: null,
        nombre: nombre,
        telefono: telefono,
        evento: evento,
        fecha_evento: fecha,
        total: total,
        importe: importe,
        concepto: document.getElementById("manualConcepto").value,
        forma_pago: document.getElementById("manualFormaPago").value,
        saldo_pendiente: saldo_pendiente,
        observaciones: document.getElementById("manualObservaciones").value,
        fecha_pago: new Date()
      }]);

    if (error) return alert(error.message);

    alert("Recibo manual creado: " + numero);
    cargarRecibos();
  };
}

async function cargarRecibos() {
  const lista = document.getElementById("listaRecibos");
  if (!lista) return;

  const { data, error } = await supabase
    .from("recibos")
    .select("*")
    .eq("user_id", usuario.id)
    .order("id", { ascending: false });

  if (error) return console.log(error);

  lista.innerHTML = "";
  data.forEach(recibo => {
    lista.innerHTML += `
      <div class="item">
        <h3>🧾 ${recibo.numero_recibo}</h3>
        <p>👤 ${recibo.nombre}</p>
        <p>🎉 ${recibo.evento}</p>
        <p>💰 Total: $${Number(recibo.total || 0).toLocaleString("es-AR")}</p>
        <p>💵 Recibido: $${Number(recibo.importe || 0).toLocaleString("es-AR")}</p>
        <p>📌 Saldo: $${Number(recibo.saldo_pendiente || 0).toLocaleString("es-AR")}</p>
        <p>📅 ${new Date(recibo.fecha_pago).toLocaleDateString("es-AR")}</p>
        <p><a href="../recibo.html?id=${recibo.id}" target="_blank">📄 Ver recibo</a></p>
        <button class="borrar" onclick="borrarRecibo(${recibo.id})">🗑️ Borrar recibo</button>
      </div>
    `;
  });

  cargarResumenNegocio();
}

window.borrarRecibo = async function(id) {
  if (!confirm("¿Borrar este recibo?")) return;

  const { error } = await supabase
    .from("recibos")
    .delete()
    .eq("id", id)
    .eq("user_id", usuario.id);

  if (error) return alert(error.message);

  alert("Recibo borrado correctamente");
  cargarRecibos();
};

// ======================
// INICIALIZACIÓN DE LA APP
// ======================
cargarResumenNegocio();
cargarImagenes();
cargarVideos();
cargarTestimonios();
cargarReservas();
cargarRecibos();
