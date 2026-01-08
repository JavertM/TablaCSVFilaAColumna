import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * INTERFACE: EncabezadoTabla
 */
interface EncabezadoTabla {
    [key: string]: string; 
}

/**
 * INTERFACE: Estructura del JSON de configuración
 */
interface ConfigEncabezados {
    campos: string[];
}

/**
 * Carga y valida el archivo JSON de encabezados
 */
function cargarConfiguracionJson(filePath: string): string[] {
    try {
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const config: ConfigEncabezados = JSON.parse(rawData);
        
        if (!config.campos || !Array.isArray(config.campos) || config.campos.length === 0) {
            throw new Error("El formato del JSON es inválido. Debe contener un array 'campos'.");
        }
        
        return config.campos.map(c => c.trim());
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Error desconocido';
        throw new Error(`Fallo al cargar configuración JSON: ${msg}`);
    }
}

async function transformarConJson(inputPath: string): Promise<void> {
    try {
        // 1. Cargar configuración desde JSON
        const CONFIG_PATH = path.resolve(process.cwd(), 'encabezado-tabla.json');
        const headers = cargarConfiguracionJson(CONFIG_PATH);
        const campoPivot = headers[0];

        // 2. Leer datos de entrada
        const content = fs.readFileSync(inputPath, 'utf-8');
        const lineas = content.split(/\r?\n/).filter(l => l.trim() !== '');

        const listaRegistros: EncabezadoTabla[] = [];
        let registroActual: Partial<EncabezadoTabla> = {};

        // 3. Procesamiento de filas a columnas
        lineas.forEach((linea) => {
            // Manejamos casos donde el valor mismo podría contener un ";"
            const separatorIndex = linea.indexOf(';');
            if (separatorIndex === -1) return;

            const llave = linea.substring(0, separatorIndex).trim();
            const valor = linea.substring(separatorIndex + 1).trim();

            // Lógica de nuevo registro basada en el primer campo del JSON
            if (llave === campoPivot && Object.keys(registroActual).length > 0) {
                listaRegistros.push(registroActual as EncabezadoTabla);
                registroActual = {};
            }

            if (headers.includes(llave)) {
                registroActual[llave] = valor;
            }
        });

        // Guardar el último
        if (Object.keys(registroActual).length > 0) {
            listaRegistros.push(registroActual as EncabezadoTabla);
        }

        // 4. Construcción del CSV de salida
        const csvRows = [
            headers.join(';'),
            ...listaRegistros.map(reg => headers.map(h => reg[h] ?? '').join(';'))
        ];

        // 5. Escritura con Timestamp (Windows 11 Compatible)
        const d = new Date();
        const ts = `${d.getFullYear()}${(d.getMonth()+1).toString().padStart(2,'0')}${d.getDate().toString().padStart(2,'0')}-` +
                   `${d.getHours().toString().padStart(2,'0')}${d.getMinutes().toString().padStart(2,'0')}${d.getSeconds().toString().padStart(2,'0')}`;
        
        const outputName = `salida-${ts}.csv`;
        fs.writeFileSync(path.join(process.cwd(), outputName), csvRows.join('\n'), 'utf-8');

        console.log(`\n🚀 Proceso finalizado con éxito`);
        console.log(`---------------------------------`);
        console.log(`📂 Entrada: ${path.basename(inputPath)}`);
        console.log(`📄 Salida:  ${outputName}`);
        console.log(`🔢 Total:   ${listaRegistros.length} registros`);

    } catch (error) {
        console.error(`\n❌ ERROR: ${error instanceof Error ? error.message : error}`);
        process.exit(1);
    }
}

// Ejecución desde terminal
const fileArg = process.argv[2];
if (!fileArg) {
    console.log("Uso: npx tsx script.ts datos.txt");
    process.exit(1);
}

transformarConJson(path.resolve(fileArg));