# Soles y Rayos de Oriente No.7 - Admin System

Sistema administrativo premium e institucional para la gestión interna de la ONG "Soles y Rayos de Oriente No.7", perteneciente a la orden Caballeros de la Luz.

## 🚀 Tecnologías

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL + Prisma ORM
- **Autenticación**: NextAuth.js (Google OAuth)
- **Estilos**: Vanilla CSS con enfoque en Premium Design (Glassmorphism, Micro-animations)
- **Notificaciones**: Telegram Bot API
- **Documentos**: jsPDF para recibos automáticos

## 🛠️ Instalación y Configuración

### Requisitos
- Node.js 18+
- Docker (opcional para la base de datos)

### Pasos
1. **Clonar el repositorio** e instalar dependencias:
   ```bash
   npm install
   ```

2. **Configurar el entorno**:
   Crea un archivo `.env` basado en las necesidades del proyecto:
   ```env
   DATABASE_URL="postgresql://admin:password@localhost:5432/soles_rayos_db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="tu_secreto_aqui"
   GOOGLE_CLIENT_ID="tu_id_de_google"
   GOOGLE_CLIENT_SECRET="tu_secreto_de_google"
   TELEGRAM_BOT_TOKEN="token_de_tu_bot"
   ```

3. **Levantar base de datos** (si usas Docker):
   ```bash
   docker-compose up -d
   ```

4. **Generar cliente Prisma y ejecutar migraciones**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

## 📋 Módulos Implementados

- **Dashboard**: Panel inteligente con métricas de ingresos vs gastos y actividad reciente.
- **Miembros**: Gestión completa de socios, estados (Activo, Mora e Inactivo) y perfiles.
- **Tesorería**: Control detallado de ingresos (Saco, Donaciones, Cuotas) y gastos debidamente categorizados.
- **Pagos**: Registro de cuotas mensuales con generación automática de recibos PDF.
- **Verificación QR**: Sistema público de verificación de identidad y estatus de miembros via QR.
- **Configuraciones**: Ajustes de moneda, meses para considerar deuda y credenciales de Telegram.

## 🎨 Principios de Diseño
El sistema utiliza una paleta de colores **Azul Nocturno y Oro**, inspirada en los símbolos de la orden. Se han implementado efectos de desenfoque (glassmorphism) para una sensación de profundidad y modernidad.

---
*Desarrollado para la Excelencia Administrativa - Socio, Caridad y Unión.*
