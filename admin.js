import { supabase } from "./supabase.js";

let usuario = null;

// 1. Verificación de Autenticación Segura
async function verificarAuth() {
  try {
    const { data: sesion, error } = await supabase.auth.getSession();
    if (error || !sesion || !sesion.session) {
      window.location.href = "login.html";
      return;
    }
    usuario = sesion.session.user;
    
    // Una vez verificado el usuario, inicializamos todo el panel
    cargarConfiguracion();
    cargarFotos();
    cargarReservas();
    cargarRecibos();
  } catch (e) {
    console.error("Error de sesión:", e);
    window.location.href = "login.html";
  }
}

verificarAuth();

// Cerrar sesión (Con respaldo directo para que funcione sí o sí)
const btnCerrar = document.getElementById("cerrarSesion");
if (btnCerrar) {
  btnCerrar.onclick = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "login.html";
  };
}

// 2. Cargar Configuración
async function cargarConfiguracion() {
  if (!usuario) return;
  const { data } = await supabase.from("configuracion").select("*").eq("user_id", usuario.id).maybeSingle();
  if (data) {
    if (document.getElementById("cfgNombre")) document.getElementById("cfgNombre").value = data.nombre_fantasia || "";
    if (document.getElementById("cfgWhatsapp")) document.getElementById("cfgWhatsapp").value = data.telefono_whatsapp || "";
    if (document.getElementById("cfgAlias")) document.getElementById("cfgAlias").value = data.alias_pago || "";
    if (document.getElementById("cfgInstagram")) document.getElementById("cfgInstagram").value = data.instagram_url || "";
  }
}

const btnGuardarConfig = document.getElementById("btnGuardarConfig");
if (btnGuardarConfig) {
  btnGuardarConfig.onclick = async () => {
    if (!usuario) return;
    const config = {
      user_id: usuario.id,
      nombre_fantasia: document.getElementById("cfgNombre").value,
      telefono_whatsapp: document.getElementById("cfgWhatsapp").value,
      alias_pago: document.getElementById("cfgAlias").value,
      instagram_url: document.getElementById("cfgInstagram").value,
    };
    const { error } = await supabase.from("configuracion").upsert(config, { onConflict: "user_id" });
    if (error) alert("Error al guardar: " + error.message);
    else alert("¡Configuración guardada!");
  };
}

// 3. Subir Fotos y mostrar galería general / de usuario
const btnSubirFoto = document.getElementById("btnSubirFoto");
if (btnSubirFoto) {
  btnSubirFoto.onclick = async () => {
    const archivoInput = document.getElementById("fotoArchivo");
    const tituloInput = document.getElementById("fotoTitulo");
    
    if (!archivoInput || !archivoInput.files[0]) return alert("Seleccioná una foto primero.");
    const archivo = archivoInput.files[0];
    const titulo = tituloInput ? tituloInput.value : "Sin título";

    const path = `galeria/${usuario ? usuario.id : 'general'}/${Date.now()}-${archivo.name}`;
    const { error: uploadError } = await supabase.storage.from("Media").upload(path, archivo);
    if (uploadError) return alert("Error al subir imagen: " + uploadError.message);

    const { data: urlData } = supabase.storage.from("Media").getPublicUrl(path);
    await supabase.from("galeria").insert([{ user_id: usuario ? usuario.id : null, Imagen: urlData.publicUrl, Titulo: titulo }]);

    alert("¡Foto subida con éxito!");
    if (tituloInput) tituloInput.value = "";
    archivoInput.value = "";
    cargarFotos();
  };
}

async function cargarFotos() {
  const cont = document.getElementById("listaFotos");
  if (!cont) return;
  
  cont.innerHTML = "<p style='font-size:12px; color:#aaa; grid-column: 1/-1;'>Cargando fotos...</p>";

  // Traemos todas las fotos para que puedas ver y administrar todo lo de la web
  let { data } = await supabase.from("galeria").select("*");
  
  if (!data || data.length === 0) {
    cont.innerHTML = "<p style='font-size:12px; color:#aaa; grid-column: 1/-1;'>No hay fotos subidas.</p>";
    return;
  }

  cont.innerHTML = "";
  data.forEach(img => {
    const imgUrl = img.Imagen || img.url || img.imagen || '';
    const imgTitulo = img.Titulo || img.titulo || img.nombre || 'Sin título';
    
    if (imgUrl) {
      cont.innerHTML += `
        <div style="background:#1a1a1a; padding:6px; border-radius:6px; text-align:center; border: 1px solid #333;">
          <img src="${imgUrl}" style="width:100%; height:90px; object-fit:cover; border-radius:4px;" alt="Foto">
          <p style="font-size:11px; margin:4px 0; color:#ddd; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${imgTitulo}">${imgTitulo}</p>
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

// 4. Reservas (Blindado para que no se quede colgado)
async function cargarReservas() {
  const cont = document.getElementById("listaReservas");
  if (!cont) return;

  // Intentamos traer todas las reservas
  let { data } = await supabase.from("reservas").select("*").order("id", { ascending: false });
  
  if (!data || data.length === 0) {
    cont.innerHTML = "<p style='font-size:13px; color:#aaa;'>No hay reservas aún.</p>";
    if (document.getElementById("dashTotalReservas")) document.getElementById("dashTotalReservas").innerText = "0";
    if (document.getElementById("dashConfirmadas")) document.getElementById("dashConfirmadas").innerText = "0";
    if (document.getElementById("dashPendientes")) document.getElementById("dashPendientes").innerText = "0";
    return;
  }

  if (document.getElementById("dashTotalReservas")) document.getElementById("dashTotalReservas").innerText = data.length;
  if (document.getElementById("dashConfirmadas")) document.getElementById("dashConfirmadas").innerText = data.filter(r => r.estado === "Confirmada").length;
  if (document.getElementById("dashPendientes")) document.getElementById("dashPendientes").innerText = data.filter(r => !r.estado || r.estado === "Pendiente").length;

  cont.innerHTML = "";
  data.forEach(r => {
    cont.innerHTML += `
      <div class="item-card">
        <h4 style="margin:0; color:#ffc107;">${r.nombre || 'Cliente'} - ${r.evento || 'Evento'}</h4>
        <p style="margin:5px 0; font-size:13px;">📅 Fecha: ${r.fecha || 'A definir'} | 📞 Tel: ${r.telefono || 'Sin tel'}</p>
        <p style="margin:5px 0; font-size:13px;">Estado: <b>${r.estado || 'Pendiente'}</b></p>
        <div style="display:flex; gap:8px; margin-top:8px;">
          <button onclick="window.confirmarReserva(${r.id})" class="btn-main" style="font-size:12px; padding:6px; flex:1; margin:0;">Confirmar</button>
          <button onclick="window.borrarReserva(${r.id})" class="btn-danger" style="font-size:12px; padding:6px; flex:1; margin:0;">Borrar</button>
        </div>
      </div>`;
  });
}

window.confirmarReserva = async (id) => {
  await supabase.from("reservas").update({ estado: "Confirmada" }).eq("id", id);
  cargarReservas();
};

window.borrarReserva = async (id) => {
  if (confirm("¿Borrar esta reserva?")) {
    await supabase.from("reservas").delete().eq("id", id);
    cargarReservas();
  }
};

// 5. Recibos
const btnCrearRecibo = document.getElementById("btnCrearRecibo");
if (btnCrearRecibo) {
  btnCrearRecibo.onclick = async () => {
    const nombre = document.getElementById("recNombre").value;
    const evento = document.getElementById("recEvento").value;
    const fecha = document.getElementById("recFecha").value;
    const total = Number(document.getElementById("recTotal").value || 0);
    const importe = Number(document.getElementById("recImporte").value || 0);
    const concepto = document.getElementById("recConcepto").value;

    if (!nombre || !total || !importe) return alert("Completá los campos obligatorios.");

    const numRecibo = `REC-${Date.now().toString().slice(-5)}`;
    const saldo = total - importe;

    const { error } = await supabase.from("recibos").insert([{
      user_id: usuario ? usuario.id : null,
      numero_recibo: numRecibo,
      nombre, evento, fecha_evento: fecha,
      total, importe, saldo_pendiente: saldo,
      concepto, fecha_pago: new Date()
    }]);

    if (error) alert("Error al emitir recibo: " + error.message);
    else {
      alert("¡Recibo " + numRecibo + " emitido!");
      document.getElementById("recNombre").value = "";
      document.getElementById("recEvento").value = "";
      document.getElementById("recTotal").value = "";
      document.getElementById("recImporte").value = "";
      document.getElementById("recConcepto").value = "";
      cargarRecibos();
    }
  };
}

async function cargarRecibos() {
  const cont = document.getElementById("listaRecibos");
  if (!cont) return;

  const { data } = await supabase.from("recibos").select("*").order("id", { ascending: false });
  
  cont.innerHTML = "";
  if (!data || data.length === 0) {
    cont.innerHTML = "<p style='font-size:12px; color:#aaa;'>No hay recibos emitidos.</p>";
    return;
  }

  data.forEach(rec => {
    cont.innerHTML += `
      <div class="item-card">
        <h4 style="margin:0; color:#ffc107;">🧾 ${rec.numero_recibo} - ${rec.nombre}</h4>
        <p style="margin:5px 0; font-size:13px;">Total: $${rec.total} | Recibido: $${rec.importe} | <b>Pendiente: $${rec.saldo_pendiente}</b></p>
        <button onclick="window.borrarRecibo(${rec.id})" class="btn-danger" style="font-size:12px; padding:6px; width:auto; margin-top:5px;">Borrar</button>
      </div>`;
  });
}

window.borrarRecibo = async (id) => {
  if (confirm("¿Borrar este recibo?")) {
    await supabase.from("recibos").delete().eq("id", id);
    cargarRecibos();
  }
};
