import { db } from "../firebase-config.js";
import {
  collection,
  getDocs,
  addDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const { jsPDF } = window.jspdf;

const btnGenerar = document.getElementById("btnGenerarReporte");
const btnExportar = document.getElementById("btnExportarPDF");
const btnGuardar = document.getElementById("btnGuardarReporte");

const tablaIngresos = document.getElementById("tablaIngresos");
const tablaReposiciones = document.getElementById("tablaReposiciones");
const graficoCategorias = document.getElementById("graficoCategorias").getContext("2d");
const graficoMovimientos = document.getElementById("graficoMovimientos").getContext("2d");

let chartCategorias, chartMovimientos;

// Variables globales para acceso en "guardar"
let ingresos = [], reposiciones = [], categorias = {}, movimientos = {};

btnGenerar.addEventListener("click", async () => {
  const desde = document.getElementById("fechaDesde").value;
  const hasta = document.getElementById("fechaHasta").value;

  if (!desde || !hasta) return alert("Seleccioná ambas fechas.");

  const desdeFecha = new Date(desde);
  const hastaFecha = new Date(hasta);
  hastaFecha.setHours(23, 59, 59, 999); // incluir todo el día "hasta"

  console.log("📅 Fecha desde:", desdeFecha);
  console.log("📅 Fecha hasta:", hastaFecha);

  const ingresosSnapshot = await getDocs(collection(db, "historial_ingresos"));
  const reposicionesSnapshot = await getDocs(collection(db, "historial_reposiciones"));

  ingresos = [];
  reposiciones = [];
  categorias = {};
  movimientos = {};

  console.log("📥 Analizando ingresos...");
  ingresosSnapshot.forEach((doc) => {
    const data = doc.data();
    const fecha = data.fecha.toDate?.() || new Date(data.fecha);
    if (fecha >= desdeFecha && fecha <= hastaFecha) {
      ingresos.push(data);
      categorias[data.categoria] = (categorias[data.categoria] || 0) + data.cantidad;
      const dia = fecha.toISOString().split("T")[0];
      movimientos[dia] = (movimientos[dia] || 0) + data.cantidad;
      console.log("✅ Ingreso válido:", data);
    } else {
      console.log("⛔ Ingreso fuera de rango:", data);
    }
  });

  console.log("📦 Analizando reposiciones...");
  reposicionesSnapshot.forEach((doc) => {
    const data = doc.data();
    const fecha = data.fecha.toDate?.() || new Date(data.fecha);
    if (fecha >= desdeFecha && fecha <= hastaFecha) {
      reposiciones.push(data);
      categorias[data.categoria] = (categorias[data.categoria] || 0) + data.cantidad;
      const dia = fecha.toISOString().split("T")[0];
      movimientos[dia] = (movimientos[dia] || 0) + data.cantidad;
      console.log("✅ Reposición válida:", data);
    } else {
      console.log("⛔ Reposición fuera de rango:", data);
    }
  });

  console.log("📊 Total ingresos válidos:", ingresos.length);
  console.log("📊 Total reposiciones válidas:", reposiciones.length);

  renderTabla(tablaIngresos, ingresos, "tablaIngresos");
  renderTabla(tablaReposiciones, reposiciones, "tablaReposiciones");
  renderGraficoCategorias(categorias);
  renderGraficoMovimientos(movimientos);
});

function renderTabla(tabla, datos, nombreTabla) {
  tabla.innerHTML = "";
  console.log(`📝 Renderizando tabla: ${nombreTabla} con ${datos.length} registros`);
  datos.forEach((d) => {
    const fila = document.createElement("tr");
    const fecha = d.fecha.toDate?.() || new Date(d.fecha);
    fila.innerHTML = `
      <td>${d.producto}</td>
      <td>${d.categoria}</td>
      <td>${d.cantidad}</td>
      <td>${fecha.toLocaleDateString()}</td>
    `;
    tabla.appendChild(fila);
  });
}

function renderGraficoCategorias(categorias) {
  if (chartCategorias) chartCategorias.destroy();
  chartCategorias = new Chart(graficoCategorias, {
    type: "pie",
    data: {
      labels: Object.keys(categorias),
      datasets: [{
        data: Object.values(categorias),
        backgroundColor: [
          "#007bff", "#17a2b8", "#28a745", "#ffc107", "#dc3545", "#6f42c1"
        ]
      }],
    },
  });
  console.log("🥧 Gráfico de categorías generado.");
}

function renderGraficoMovimientos(movimientos) {
  if (chartMovimientos) chartMovimientos.destroy();
  const dias = Object.keys(movimientos).sort();
  chartMovimientos = new Chart(graficoMovimientos, {
    type: "line",
    data: {
      labels: dias,
      datasets: [{
        label: "Total movimientos",
        data: dias.map((d) => movimientos[d]),
        fill: false,
        borderColor: "#007bff",
        tension: 0.2,
      }],
    },
  });
  console.log("📈 Gráfico de movimientos generado.");
}

btnExportar.addEventListener("click", async () => {
  const pdf = new jsPDF("p", "pt", "a4");
  const canvas = await html2canvas(document.querySelector("main"), {
    scale: 2, // mejora la calidad de imagen
    useCORS: true
  });

  const imgData = canvas.toDataURL("image/png");
  const imgProps = pdf.getImageProperties(imgData);

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  const pageHeight = pdf.internal.pageSize.getHeight();
  let heightLeft = pdfHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;
  }

  pdf.save("reporte.pdf");
});


btnGuardar.addEventListener("click", async () => {
  if (ingresos.length === 0 && reposiciones.length === 0) {
    alert("⚠️ No hay datos que guardar. Generá un reporte primero.");
    return;
  }

  try {
    await addDoc(collection(db, "reportes_guardados"), {
      fecha_desde: document.getElementById("fechaDesde").value,
      fecha_hasta: document.getElementById("fechaHasta").value,
      ingresos,
      reposiciones,
      categorias_totales: categorias,
      movimiento_diario: movimientos,
      fecha_guardado: Timestamp.now()
    });

    alert("✅ Reporte guardado correctamente.");
  } catch (error) {
    console.error("❌ Error al guardar el reporte:", error);
    alert("❌ Hubo un error al guardar el reporte.");
  }
});
