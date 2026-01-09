# 📑 Documentación: TS-CSV Transformer Pro

## 1. Descripción General

**TS-CSV Transformer Pro** es una herramienta de línea de comandos (CLI) desarrollada en **TypeScript** diseñada para automatizar la transformación de datos no estructurados o semiestructurados a un formato **CSV estándar (RFC 4180)**.

La herramienta es capaz de alternar entre diferentes lógicas de lectura (estrategias) mediante archivos de configuración JSON, garantizando la integridad de los datos, el tipado estricto y la compatibilidad con sistemas legados (Excel) mediante la codificación **ISO 8859-1**.

---

## 2. Arquitectura del Sistema

El proyecto sigue el **Patrón de Diseño "Strategy"** (Estrategia). Esto permite que el motor principal sea independiente de la forma en que se leen los datos.

### Estructura de Archivos

* `/index.ts`: Orquestador principal y motor de exportación.
* `/strategies/`:
* `types.ts`: Definición de interfaces y contratos.
* `KeyValueStrategy.ts`: Procesa datos con formato `Llave;Valor`.
* `SequentialStrategy.ts`: Procesa datos que vienen en bloques de líneas fijas.

* `/config/`:
* `encabezado-tabla.json`: Define las columnas de salida.
* `formato-entrada.json`: Define el comportamiento del parser.

---

## 3. Configuración (Contratos JSON)

### A. `encabezado-tabla.json`

Define el nombre y el orden de las columnas en el archivo final.

```json
{
  "campos": ["Registro", "Nombre", "Código", "Stock"]
}

```

### B. `formato-entrada.json`

Controla cómo el script interpreta el archivo de origen.

* `tipo`: Puede ser `"KEY_VALUE"` o `"SEQUENTIAL"`.
* `codificacion`: Codificación del archivo de origen (ej. `"utf-8"`).
* `delimitador`: (Solo para KEY_VALUE) El carácter que separa llave de valor.

---

## 4. Modos de Procesamiento

### Modo A: Clave-Valor (`KEY_VALUE`)

Ideal para archivos donde cada dato está identificado. El script detecta un nuevo registro cada vez que encuentra el primer campo definido en el JSON.
**Ejemplo de entrada:**

```text
Registro;001
Nombre;Jabon Elite
Código;40123

```

### Modo B: Secuencial (`SEQUENTIAL`)

Ideal para reportes de sistemas que entregan datos línea por línea en un orden fijo. El script agrupa las líneas según la cantidad de campos definidos en el JSON.
**Ejemplo de entrada:**

```text
001
Jabon Elite
40123

```

---

## 5. Especificaciones de Salida

* **Delimitador:** Punto y coma (`;`).
* **Quoting (Comillas):** Todos los valores se envuelven en `" "`. Las comillas internas se escapan como `""`.
* **Codificación:** ISO 8859-1 (Latin-1) para compatibilidad total con Windows y Excel.
* **Nomenclatura:** `salida-AAAAMMDD-HHMMSS.csv`.

---

## 6. Instalación y Uso

### Requisitos Previos

* **Node.js** (v18 o superior).
* **pnpm** (recomendado).

### Instalación

```powershell
# Instalar dependencias
pnpm install

# Instalar tipos de Node si no están
pnpm add -D @types/node typescript tsx

```

### Ejecución

Para procesar un archivo, abre la terminal en Windows 11 y ejecuta:

```powershell
npx tsx index.ts ruta/a/tu/archivo_datos.txt

```

---

## 7. Manejo de Errores

El sistema incluye un módulo de diagnóstico que captura:

1. **Errores de Configuración:** Si el JSON está mal formado o faltan campos.
2. **Errores de Estrategia:** Si el `tipo` en el JSON no coincide con las estrategias programadas.
3. **Errores de Tipado:** Gracias al modo estricto de TypeScript, se previenen errores de "propiedad no encontrada" o "datos indefinidos" en tiempo de ejecución.

---

## 8. Guía de Mantenimiento

Para agregar un nuevo formato de entrada:

1. Crear un archivo en `/strategies/NuevaEstrategia.ts` que implemente `ParsingStrategy`.
2. Registrar la clase en el objeto `estrategias` dentro de `index.ts`.
3. Actualizar `formato-entrada.json` con el nuevo `tipo`.

---

**Documentación generada el:** 09 de Enero de 2026.
**Autor:** Arquitecto de Software (IA Partner).

**¿Te gustaría que añadamos una sección de "Preguntas Frecuentes" o una guía de resolución de problemas específicos de Windows?**
