import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export async function generateModelo40(data: any, month: number, year: number) {
  const doc = new jsPDF();
  const monthName = format(new Date(year, month - 1), 'MMMM', { locale: es });

  // Header
  doc.setFontSize(16);
  doc.text("Balance General mensual", 105, 15, { align: "center" });
  doc.setFontSize(12);
  doc.text("Modelo 40", 180, 15);
  doc.line(10, 20, 200, 20);

  doc.setFontSize(10);
  doc.text(`Mes de: ${monthName} ${year}`, 10, 28);

  // Table structure (Simple representation for now)
  let y = 35;
  const colWidths = [15, 100, 35, 35];
  const startX = 10;

  const drawRow = (code: string, detail: string, amount: string, accumulated: string, isHeader = false) => {
    if (isHeader) doc.setFont("helvetica", "bold");
    else doc.setFont("helvetica", "normal");

    doc.text(code, startX + 2, y);
    doc.text(detail, startX + 17, y);
    doc.text(amount, startX + 117 + 33, y, { align: "right" });
    doc.text(accumulated, startX + 152 + 33, y, { align: "right" });
    
    y += 7;
    doc.line(startX, y - 5, 200, y - 5);
  };

  doc.line(startX, y - 5, 200, y - 5);
  drawRow("Código", "Detalle", "Este mes", "Acumulado", true);

  // Saldo Patrimonio
  const initialEquity = data.lastCountBeforeMonth?.totalActualUYU || 0;
  drawRow("", "Saldo del Patrimonio al Inicio del Periodo", `$ ${initialEquity.toFixed(2)}`, "");

  // Ingresos
  doc.setFont("helvetica", "bold");
  doc.text("Ingresos", startX + 2, y);
  y += 7;

  const incomeCategories = [
    { code: "1", label: "Cobro de Cuotas", type: "COBRO_CUOTAS" },
    { code: "2", label: "Iniciaciones y Afiliaciones", type: "INICIACIONES_AFILIACIONES" },
    { code: "3", label: "Colectas del Saco benéfico", type: "COLECTAS_SACO_BENEFICO" },
    { code: "4", label: "Donativos Recibidos", type: "DONATIVOS_RECIBIDOS" },
    { code: "5", label: "Importe Recibido a entregar", type: "IMPORTE_A_ENTREGAR" },
    { code: "6", label: "Ingresos Eventuales", type: "INGRESOS_EVENTUALES" },
  ];

  let totalIncomeMonth = 0;
  incomeCategories.forEach(cat => {
    let amount = 0;
    if (cat.type === "COBRO_CUOTAS") {
      amount = data.payments.reduce((a: any, b: any) => a + b.amount, 0);
    } else {
      amount = data.incomes.filter((i: any) => i.type === cat.type).reduce((a: any, b: any) => a + b.amount, 0);
    }
    
    let yearAmount = 0;
    if (cat.type === "COBRO_CUOTAS") {
       yearAmount = data.yearTotals.payments.reduce((a: any, b: any) => a + b.amount, 0);
    } else {
       yearAmount = data.yearTotals.incomes.filter((i: any) => i.type === cat.type).reduce((a: any, b: any) => a + b.amount, 0);
    }

    totalIncomeMonth += amount;
    drawRow(cat.code, cat.label, `$ ${amount.toFixed(2)}`, `$ ${yearAmount.toFixed(2)}`);
  });

  // Egresos
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Egresos", startX + 2, y);
  y += 7;

  const expenseCategories = [
    { code: "8", label: "Der. Iniciación y afiliación", type: "DERECHOS_INICIACION_AFILIACION" },
    { code: "9", label: "Sello timbre y serv. Correos", type: "SELLO_TIMBRE_CORREOS" },
    { code: "10", label: "Mat. Oficina e Impresos", type: "MATERIALES_OFICINA_IMPRESOS" },
    { code: "11", label: "Serv. y gastos bancarios", type: "SERVICIOS_GASTOS_BANCARIOS" },
    { code: "12", label: "Servicio importe recibido", type: "SERVICIO_IMPORTE_RECIBIDO" },
    { code: "13", label: "Mant. muebles y equipos", type: "MANTENIMIENTO_MUEBLES_EQUIPOS" },
    { code: "14", label: "Gastos de actos y fiesta", type: "GASTOS_ACTOS_FIESTA" },
    { code: "15", label: "Gastos funcionarios logia", type: "GASTOS_FUNCIONARIOS_LOGIA" },
    { code: "16", label: "Ofrendas florales", type: "OFRENDAS_FLORALES" },
    { code: "17", label: "Pago cuotas hermanos logia", type: "PAGOS_CUOTAS_HERMANOS_LOGIA" },
    { code: "18", label: "Obsequios", type: "OBSEQUIOS" },
    { code: "19", label: "Donativos hermanos logia", type: "DONATIVOS_HERMANOS_LOGIA" },
    { code: "20", label: "Donativos hermanos otras log.", type: "DONATIVOS_HERMANOS_OTRAS_LOGIAS" },
    { code: "21", label: "Ayuda mant. edificio", type: "AYUDA_MANTENIMIENTO_EDIFICIO" },
    { code: "22", label: "Amortización préstamos", type: "AMORTIZACION_PRESTAMOS_RECIBIDOS" },
    { code: "23", label: "Mant. y limpieza inmueble", type: "MANTENIMIENTO_LIMPIEZA_INMUEBLE" },
    { code: "24", label: "Electricidad (UTE)", type: "ELECTRICIDAD_UTE" },
    { code: "25", label: "Agua (OSE)", type: "AGUA_OSE" },
    { code: "26", label: "Internet", type: "INTERNET" },
    { code: "27", label: "Alquiler local/Casa Templo", type: "ALQUILER_LOCAL_CASA_TEMPLO" },
    { code: "28", label: "Aseguradoras/Garantías", type: "ASEGURADORAS_GARANTIAS" },
    { code: "29", label: "Inmobiliarias", type: "INMOBILIARIAS" },
    { code: "30", label: "Gastos eventuales", type: "GASTOS_EVENTUALES" },
    { code: "31", label: "Gastos en trámites", type: "GASTOS_TRAMITES" },
  ];

  let totalExpenseMonth = 0;
  expenseCategories.forEach(cat => {
    const amount = data.expenses.filter((e: any) => e.category === cat.type).reduce((a: any, b: any) => a + b.amount, 0);
    const yearAmount = data.yearTotals.expenses.filter((e: any) => e.category === cat.type).reduce((a: any, b: any) => a + b.amount, 0);
    totalExpenseMonth += amount;
    
    // Only draw if there's any movement in the month or year, to save space, or draw all?
    // User model shows all, so we draw all.
    if (y > 270) { doc.addPage(); y = 20; }
    drawRow(cat.code, cat.label, `$ ${amount.toFixed(2)}`, `$ ${yearAmount.toFixed(2)}`);
  });

  // Final Patrimonio
  y += 10;
  const finalEquity = initialEquity + totalIncomeMonth - totalExpenseMonth;
  doc.setFont("helvetica", "bold");
  drawRow("", "Saldo del Patrimonio al Final del periodo", `$ ${finalEquity.toFixed(2)}`, `$ ${finalEquity.toFixed(2)}`);

  // Situación de los Fondos
  y += 10;
  doc.text("Situación de los Fondos", startX + 2, y);
  y += 7;
  
  if (data.monthAudit) {
    drawRow("1", "Efectivo en banco", `$ ${data.monthAudit.actualBankUYU.toFixed(2)}`, "");
    drawRow("2", "Efectivo por depositar", `$ ${data.monthAudit.actualCashUYU.toFixed(2)}`, ""); // mapped to Cash for now
    drawRow("3", "Fondo fijo (caja chica)", "$-", "");
  }

  doc.save(`Modelo40_${month}_${year}.pdf`);
}
