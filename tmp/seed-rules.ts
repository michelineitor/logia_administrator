import { PrismaClient, AlertCategory, AlertSeverity } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const defaultRules = [
    {
      name: "Déficit en el mes",
      description: "Gastos superan los ingresos en el mes actual.",
      category: AlertCategory.FINANCIAL,
      severity: AlertSeverity.ERROR,
      logic: {
        dataSource: "INCOMES",
        modifier: "CURRENT_MONTH",
        operator: "<",
        compareTo: "EXPENSES_CURRENT_MONTH",
        compareValue: 0,
      },
    },
    {
      name: "Reservas < 3 meses",
      description: "El dinero en caja/banco no alcanza para cubrir 3 meses de gastos promedio.",
      category: AlertCategory.FINANCIAL,
      severity: AlertSeverity.ERROR,
      logic: {
        dataSource: "RESERVES",
        modifier: "RUNWAY_MONTHS",
        operator: "<",
        compareTo: "STATIC",
        compareValue: 3,
      },
    },
    {
      name: "Caída de ingresos vs promedio",
      description: "Los ingresos de este mes son menores al 70% del promedio de los últimos 6 meses.",
      category: AlertCategory.FINANCIAL,
      severity: AlertSeverity.WARNING,
      logic: {
        dataSource: "INCOMES",
        modifier: "CURRENT_MONTH",
        operator: "<",
        compareTo: "AVERAGE_6_MONTHS",
        compareValue: 0.7,
      },
    },
    {
      name: "Muchos miembros en mora",
      description: "Más del 15% de los miembros tienen deudas de 3 meses o más.",
      category: AlertCategory.OPERATIONAL,
      severity: AlertSeverity.ERROR,
      logic: {
        dataSource: "MEMBERS_DEBT",
        modifier: "PERCENTAGE",
        operator: ">",
        compareTo: "STATIC",
        compareValue: 15,
      },
    },
    {
      name: "Gastos sin documentación",
      description: "Existen gastos registrados sin comprobante adjunto.",
      category: AlertCategory.GOVERNANCE,
      severity: AlertSeverity.ERROR,
      logic: {
        dataSource: "UNVERIFIED_EXPENSES",
        modifier: "COUNT",
        operator: ">",
        compareTo: "STATIC",
        compareValue: 0,
      },
    }
  ];

  console.log("Seeding rules...");
  for (const rule of defaultRules) {
    const exists = await prisma.alertRule.findFirst({ where: { name: rule.name } });
    if (!exists) {
      await prisma.alertRule.create({
        data: rule as any,
      });
      console.log(`Created rule: ${rule.name}`);
    } else {
      console.log(`Rule already exists: ${rule.name}`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
