declare module 'json2csv' {
  export class Parser<T = any> {
    constructor(options?: ParserOptions<T>);
    parse(data: T[]): string;
  }

  export interface ParserOptions<T> {
    fields?: string[] | FieldInfo<T>[];
    transforms?: Transform<T>[];
    defaultValue?: any;
    quote?: string;
    escapedQuote?: string;
    delimiter?: string;
    eol?: string;
    excelStrings?: boolean;
    includeEmptyRows?: boolean;
    withBOM?: boolean;
    header?: boolean;
  }

  export interface FieldInfo<T> {
    label: string;
    value: string | ((row: T) => any);
    default?: any;
  }

  export type Transform<T> = (row: T) => T;
}