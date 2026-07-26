import { supabase } from "./supabase.js";

// 1. Verificación de Autenticación
const { data: sesion } = await supabase.auth.getSession();
if (!sesion || !sesion.session) {
  window.location.href = "login.html";
}
const usuario = sesion.session.user;

// Cerrar sesión
document.getElementById("cerrarSesion").onclick = async () => {
  await supabase.auth.signOut();
  window.location.href = "login.html";
};

// 2. Cargar Configuración
async function cargarConfiguracion() {
  const { data } = await supabase.from("configuracion").select("*").eq("user_id", usuario.id).maybeSingle();
  if (data) {
    document.getElementById("cfgNombre").value = data.nombre_fantasia || "";
    document.getElementById("cfgWhatsapp").value = data.telefono_whatsapp || "";
    document.getElementById("cfgAlias").value = data.alias_pago || "";
    document.getElementById("cfgInstagram").value = data.instagram_url || "";
  }
}

document.getElementById("btnGuardarConfig").onclick = async () => {
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

// 3. Subir Fotos
document.getElementById("btnSubirFoto").onclick = async () => {
  const archivo = document.getElementById("fotoArchivo").files[0];
  const titulo = document.getElementById("fotoTitulo").value;
  if (!archivo) return alert("Seleccioná una foto primero.");

  const path = `galeria/${usuario.id}/${Date.now()}-${archivo.name}`;
  const { error: uploadError } = await supabase.storage.from("Media").upload(path, archivo);
  if (uploadError) return alert("Error al subir imagen: " + uploadError.message);

  const { data: urlData } = supabase.storage.from("Media").getPublicUrl(path);
  await supabase.from("galeria").insert([{ user_id: usuario.id, Imagen: urlData.publicUrl, Titulo: titulo }]);

  alert("¡Foto subida con éxito!");
  cargarFotos();
};

async function cargarFotos() {
  const cont = document.getElementById("listaFotos");
  const { data } = await supabase.from("galeria").select("*").eq("user_id", usuario.id);
  cont.innerHTML = "";
  if (data) {
    data.forEach(img => {
      cont.innerHTML += `
        <div style="background:#1a1a1a; padding:5px; border-radius:6px; text-align:center;">
          <img src="${img.Imagen}" style="width:100px; height:100px; object-fit:cover; border-radius:4px;">
          <br><button onclick="window.borrarFoto(${img.id})" class="btn-danger" style="margin-top:5px; font-size:10px; padding:4px 8px;">Borrar</button>
        </div>`;
    });
  }
}

window.borrarFoto = async (id) => {
  if (confirm("¿Borrar esta imagen?")) {
    await supabase.from("galeria").delete().eq("id", id);
    cargarFotos();
  }
};

// 4. Reservas
async function cargarReservas() {
  const cont = document.getElementById("listaReservas");
  const { data } = await supabase.from("reservas").select("*").eq("user_id", usuario.id).order("id", { ascending: false });
  
  if (!data || data.length === 0) {
    cont.innerHTML = "<p>No hay reservas aún.</p>";
    return;
  }

  document.getElementById("dashTotalReservas").innerText = data.length;
  document.getElementById("dashConfirmadas").innerText = data.filter(r => r.estado === "Confirmada").length;
  document.getElementById("dashPendientes").innerText = data.filter(r => !r.estado || r.estado === "Pendiente").length;

  cont.innerHTML = "";
  data.forEach(r => {
    cont.innerHTML += `
      <div class="item-card">
        <h4 style="margin:0;">${r.nombre} - ${r.evento || 'Evento'}</h4>
        <p style="margin:5px 0; font-size:13px;">📅 Fecha: ${r.fecha || 'A definir'} | 📞 Tel: ${r.telefono}</p>
        <p style="margin:5px 0; font-size:13px;">Estado: <b>${r.estado || 'Pendiente'}</b></p>
        <button onclick="window.confirmarReserva(${r.id})" style="font-size:12px;">Confirmar</button>
        <button onclick="window.borrarReserva(${r.id})" class="btn-danger" style="font-size:12px;">Borrar</button>
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
document.getElementById("btnCrearRecibo").onclick = async () => {
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
    user_id: usuario.id,
    numero_recibo: numRecibo,
    nombre, evento, fecha_evento: fecha,
    total, importe, saldo_pendiente: saldo,
    concepto, fecha_pago: new Date()
  }]);

  if (error) alert("Error al emitir recibo: " + error.message);
  else {
    alert("¡Recibo " + numRecibo + " emitido!");
    cargarRecibos();
  }
};

async function cargarRecibos() {
  const cont = document.getElementById("listaRecibos");
  const { data } = await supabase.from("recibos").select("*").eq("user_id", usuario.id).order("id", { ascending: false });
  
  cont.innerHTML = "";
  if (data) {
    data.forEach(rec => {
      cont.innerHTML += `
        <div class="item-card">
          <h4 style="margin:0;">🧾 ${rec.numero_recibo} - ${rec.nombre}</h4>
          <p style="margin:5px 0; font-size:13px;">Total: $${rec.total} | Recibido: $${rec.importe} | <b>Pendiente: $${rec.saldo_pendiente}</b></p>
          <button onclick="window.borrarRecibo(${rec.id})" class="btn-danger" style="font-size:12px;">Borrar</button>
        </div>`;
    });
  }
}

window.borrarRecibo = async (id) => {
  if (confirm("¿Borrar este recibo?")) {
    await supabase.from("recibos").delete().eq("id", id);
    cargarRecibos();
  }
};

// Inicializar todo
cargarConfiguracion();
cargarFotos();
cargarReservas();
cargarRecibos();
