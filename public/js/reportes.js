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
let ingresos = [], reposiciones = [], categorias = {}, movimientos = {};

btnGenerar.addEventListener("click", async () => {
  const desde = document.getElementById("fechaDesde").value;
  const hasta = document.getElementById("fechaHasta").value;
  if (!desde || !hasta) return alert("Seleccioná ambas fechas.");

  const desdeFecha = new Date(desde);
  const hastaFecha = new Date(hasta);
  hastaFecha.setHours(23, 59, 59, 999);

  const ingresosSnapshot = await getDocs(collection(db, "historial_ingresos"));
  const reposicionesSnapshot = await getDocs(collection(db, "historial_reposiciones"));

  ingresos = [];
  reposiciones = [];
  categorias = {};
  movimientos = {};

  const productosConMovimiento = new Set();

  ingresosSnapshot.forEach((doc) => {
    const data = doc.data();
    const fecha = data.fecha.toDate?.() || new Date(data.fecha);
    if (fecha >= desdeFecha && fecha <= hastaFecha) {
      ingresos.push(data);
      productosConMovimiento.add((data.producto || "").trim().toLowerCase());
      categorias[data.categoria] = (categorias[data.categoria] || 0) + data.cantidad;
      const dia = fecha.toISOString().split("T")[0];
      movimientos[dia] = (movimientos[dia] || 0) + data.cantidad;
    }
  });

  reposicionesSnapshot.forEach((doc) => {
    const data = doc.data();
    const fecha = data.fecha.toDate?.() || new Date(data.fecha);
    if (fecha >= desdeFecha && fecha <= hastaFecha) {
      reposiciones.push(data);
      productosConMovimiento.add((data.producto || "").trim().toLowerCase());
      categorias[data.categoria] = (categorias[data.categoria] || 0) + data.cantidad;
      const dia = fecha.toISOString().split("T")[0];
      movimientos[dia] = (movimientos[dia] || 0) + data.cantidad;
    }
  });

  // ORDENAR por fecha
ingresos.sort((a, b) => (b.fecha?.toDate?.() || new Date(b.fecha)) - (a.fecha?.toDate?.() || new Date(a.fecha)));
reposiciones.sort((a, b) => (b.fecha?.toDate?.() || new Date(b.fecha)) - (a.fecha?.toDate?.() || new Date(a.fecha)));


  renderTabla(tablaIngresos, ingresos);
  renderTabla(tablaReposiciones, reposiciones);
  renderGraficoCategorias(categorias);
  renderGraficoMovimientos(movimientos);

  const productosSnapshot = await getDocs(collection(db, "productos"));
  const productosStockCero = [];

  productosSnapshot.forEach((doc) => {
    const data = doc.data();
    const stockActual = typeof data.stock === "string" ? parseInt(data.stock) : data.stock;
    const nombreProducto = (data.producto || "").trim().toLowerCase();

    if (stockActual === 0 && productosConMovimiento.has(nombreProducto)) {
      productosStockCero.push(data);
    }
  });

  const tablaStockCero = document.getElementById("stockCeroProductos");
  if (tablaStockCero) renderTablaStockCero(tablaStockCero, productosStockCero);
});

function renderTabla(tabla, datos) {
  tabla.innerHTML = "";
  datos.forEach((d) => {
    const fecha = d.fecha.toDate?.() || new Date(d.fecha);
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${d.producto}</td>
      <td>${d.categoria}</td>
      <td>${d.cantidad}</td>
      <td>${fecha.toLocaleDateString()}</td>
    `;
    tabla.appendChild(fila);
  });
}

function renderTablaStockCero(tabla, lista) {
  tabla.innerHTML = "";
  lista.forEach((prod) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${prod.codigo || "-"}</td>
      <td>${prod.producto}</td>
      <td>${prod.categoria}</td>
      <td>Stock = 0</td>
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
        backgroundColor: ["#007bff", "#17a2b8", "#28a745", "#ffc107", "#dc3545", "#6f42c1"]
      }],
    },
  });
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
}

btnExportar.addEventListener("click", async () => {
  const pdf = new jsPDF("p", "pt", "a4");
  const canvas = await html2canvas(document.querySelector("main"), {
    scale: 2,
    useCORS: true
  });

  const imgData = canvas.toDataURL("image/png");
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  let heightLeft = pdfHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
  heightLeft -= pdf.internal.pageSize.getHeight();

  while (heightLeft > 0) {
    position -= pdf.internal.pageSize.getHeight();
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();
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
