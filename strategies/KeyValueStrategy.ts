import { ParsingStrategy, EncabezadoTabla } from './types';

export class KeyValueStrategy implements ParsingStrategy {
    execute(lineas: string[], headers: string[], config: any): EncabezadoTabla[] {
        const lista: EncabezadoTabla[] = [];
        let registroActual: Partial<EncabezadoTabla> = {};
        const campoPivot = headers[0];
        const delimitador = config.delimitador || ';';

        lineas.forEach(linea => {
            const idx = linea.indexOf(delimitador);
            if (idx === -1) return;

            const llave = linea.substring(0, idx).trim();
            const valor = linea.substring(idx + 1).trim();

            if (llave === campoPivot && Object.keys(registroActual).length > 0) {
                lista.push(registroActual as EncabezadoTabla);
                registroActual = {};
            }

            if (headers.includes(llave)) {
                registroActual[llave] = valor;
            }
        });
        if (Object.keys(registroActual).length > 0) lista.push(registroActual as EncabezadoTabla);
        return lista;
    }
}