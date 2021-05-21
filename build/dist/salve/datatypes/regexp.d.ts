export declare class SalveParsingError extends Error {
    constructor(msg: string);
}
export declare function parse(input: string, outputType: "string"): string;
export declare function parse(input: string, outputType?: "re"): RegExp;
