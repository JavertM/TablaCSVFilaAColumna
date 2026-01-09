import * as fs from 'node:fs';
import * as path from 'node:path';
import { KeyValueStrategy } from './strategies/KeyValueStrategy';
import { SequentialStrategy } from './strategies/SequentialStrategy';
import { ParsingStrategy, EncabezadoTabla } from './strategies/types';

// 1. Registro de Estrategias
const estrategias: Record<string, ParsingStrategy> = {
    'KEY_VALUE': new KeyValueStrategy(),
    'SEQUENTIAL': new SequentialStrategy()
};

/**
 * Función auxiliar para formatear celdas según el estándar CSV (RFC 4180)
 * Envuelve el valor en comillas dobles y escapa las comillas existentes.
 */
const formatCSVCell = (val: string): string => {
    // Escapar comillas dobles internas duplicándolas
    const escaped = val.replace(/"/g, '""');
    return `"${escaped}"`;
};

async function main() {
    try {
        const inputArg = process.argv[2];
        if (!inputArg) {
            throw new Error("Uso: npx tsx index.ts <archivo_datos.txt>");
        }
        const inputPath = path.resolve(inputArg);

        // 2. Carga de configuraciones
        if (!fs.existsSync('formato-entrada.json') || !fs.existsSync('encabezado-tabla.json')) {
            throw new Error("Faltan archivos de configuración JSON.");
        }

        const configFormato = JSON.parse(fs.readFileSync('formato-entrada.json', 'utf-8'));
        const configEncabezados = JSON.parse(fs.readFileSync('encabezado-tabla.json', 'utf-8'));
        const headers: string[] = configEncabezados.campos;

        // 3. Selección de Estrategia (usamos 'tipo' según la corrección anterior)
        const tipoEstrategia = configFormato.tipo;
        const estrategia = estrategias[tipoEstrategia];

        if (!estrategia) {
            throw new Error(`La estrategia '${tipoEstrategia}' no está definida. Verifica 'formato-entrada.json'.`);
        }

        // 4. Lectura de datos con tipado estricto
        const encodingInput = (configFormato.codificacion || 'utf-8') as BufferEncoding;
        const content = fs.readFileSync(inputPath, encodingInput) as string;

        const lineas = content
            .split(/\r?\n/)
            .map((l: string) => l.trim())
            .filter((l: string) => l !== '');

        // 5. Procesamiento
        console.log(`🚀 Iniciando transformación [Modo: ${tipoEstrategia}]`);
        const resultados: EncabezadoTabla[] = estrategia.execute(lineas, headers, configFormato);

        // 6. Construcción del CSV con Quoting (Comillas)
        // Aplicamos formatCSVCell tanto a cabeceras como a valores
        const csvFinal = [
            headers.map((h: string) => formatCSVCell(h)).join(';'), 
            ...resultados.map((r: EncabezadoTabla) => 
                headers.map((h: string) => formatCSVCell(r[h] || '')).join(';')
            )
        ].join('\n');

        // 7. Escritura en ISO 8859-1 (latin1)
        const ahora = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const timestamp = `${ahora.getFullYear()}${pad(ahora.getMonth() + 1)}${pad(ahora.getDate())}-${pad(ahora.getHours())}${pad(ahora.getMinutes())}${pad(ahora.getSeconds())}`;
        
        const outputName = `salida-${timestamp}.csv`;
        
        // 'latin1' es el equivalente exacto de ISO 8859-1 en Node.js
        fs.writeFileSync(outputName, csvFinal, 'latin1');

        console.log(`-------------------------------------------`);
        console.log(`✅ ¡Proceso finalizado!`);
        console.log(`📄 Salida: ${outputName}`);
        console.log(`🔠 Codificación: ISO 8859-1 (Latin-1)`);
        console.log(`🔢 Registros: ${resultados.length}`);
        console.log(`-------------------------------------------`);

    } catch (e) {
        console.error("\n=== 🛑 ERROR CRÍTICO ===");
        console.error(e instanceof Error ? e.message : String(e));
        console.error("========================\n");
        process.exit(1);
    }
}

main();