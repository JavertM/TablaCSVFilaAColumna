export interface EncabezadoTabla { [key: string]: string; }

export interface ParsingStrategy {
    execute(lineas: string[], headers: string[], config: any): EncabezadoTabla[];
}