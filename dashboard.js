import { supabase } from "./supabase.js";

// ======================
// DASHBOARD LEITMIX
// ======================

async function actualizarDashboard() {
  // Traemos los campos necesarios de la tabla 'reservas'
  const { data, error } = await supabase
    .from("reservas")
    .select("estado, tipo_evento, fecha_evento, created_at");

  if (error) {
    console.log("Error dashboard:", error);
    return;
  }

  // 1. MÉTRICAS GENERALES
  document.getElementById("totalReservasDash").innerText = data.length;

  document.getElementById("pendientesDash").innerText =
    data.filter(r => r.estado === "Pendiente").length;

  document.getElementById("confirmadasDash").innerText =
    data.filter(r => r.estado === "Confirmada").length;

  // 2. ANALÍTICA: RESERVAS POR MES (AÑO ACTUAL)
  const anioActual = new Date().getFullYear();
  const nombresMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const reservasPorMes = Array(12).fill(0);

  // 3. ANALÍTICA: SERVICIOS / EVENTOS MÁS CONTRATADOS
  const serviciosContador = {};

  data.forEach(r => {
    // Procesar mes del evento
    const fecha = r.fecha_evento ? new Date(r.fecha_evento) : new Date(r.created_at);
    if (fecha.getFullYear() === anioActual) {
      reservasPorMes[fecha.getMonth()] += 1;
    }

    // Procesar tipo de servicio
    const servicio = r.tipo_evento || "Sin Especificar";
    serviciosContador[servicio] = (serviciosContador[servicio] || 0) + 1;
  });

  // 4. RENDERIZAR BARRAS DE MESES EN EL HTML
  const maxReservasMes = Math.max(...reservasPorMes, 1);
  const contMeses = document.getElementById("contenedorMeses");

  if (contMeses) {
    contMeses.innerHTML = nombresMeses.map((mes, idx) => {
      const cantidad = reservasPorMes[idx];
      const porcentaje = (cantidad / maxReservasMes) * 100;
      return `
        <div style="display: flex; align-items: center; gap: 10px; font-size: 13px; color: #fff;">
          <span style="width: 35px; font-weight: bold;">${mes}</span>
          <div style="flex: 1; background: #333; height: 10px; border-radius: 5px; overflow: hidden;">
            <div style="width: ${porcentaje}%; background: #f5b400; height: 100%; transition: width 0.3s ease;"></div>
          </div>
          <span style="width: 25px; text-align: right; font-weight: bold; color: #f5b400;">${cantidad}</span>
        </div>
      `;
    }).join("");
  }

  // 5. RENDERIZAR LISTA DE SERVICIOS MÁS CONTRATADOS
  const contServicios = document.getElementById("contenedorServicios");

  if (contServicios) {
    const serviciosOrdenados = Object.entries(serviciosContador)
      .sort((a, b) => b[1] - a[1]);

    if (serviciosOrdenados.length === 0) {
      contServicios.innerHTML = `<p style="color: #888; font-size: 14px;">No hay registros de servicios aún.</p>`;
    } else {
      contServicios.innerHTML = serviciosOrdenados.map(([servicio, cantidad]) => `
        <div style="display: flex; justify-content: space-between; align-items: center; background: #2a2a2a; padding: 10px 14px; border-radius: 6px; color: #fff; margin-bottom: 6px;">
          <span style="font-size: 14px; font-weight: 500;">${servicio}</span>
          <span style="background: #f5b400; color: #000; padding: 2px 10px; border-radius: 12px; font-weight: bold; font-size: 13px;">${cantidad}</span>
        </div>
      `).join("");
    }
  }
}

actualizarDashboard();
