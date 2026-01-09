import { ParsingStrategy, EncabezadoTabla } from './types';

export class SequentialStrategy implements ParsingStrategy {
    execute(lineas: string[], headers: string[]): EncabezadoTabla[] {
        const lista: EncabezadoTabla[] = [];
        const numCampos = headers.length;

        for (let i = 0; i < lineas.length; i += numCampos) {
            const registro: EncabezadoTabla = {};
            headers.forEach((h, index) => {
                registro[h] = lineas[i + index] || "";
            });
            lista.push(registro);
        }
        return lista;
    }
}