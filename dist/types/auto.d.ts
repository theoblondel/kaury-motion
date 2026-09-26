/** Reads `data-km-*` attributes into an options object with numbers and booleans parsed. */
export declare function readOptions(el: HTMLElement): Record<string, any>;
/**
 * Wires up every `[data-km]` element under `root`. Several effects can be
 * combined with spaces: `data-km="extrude tilt float"`.
 *
 * Text reveals: `data-km="rise|fade|blur|flip|pop|slide|swing|zoom|type"`, with
 * `data-km-by="chars"`, `data-km-each="40"`, `data-km-delay="200"`…
 */
export declare function auto(root?: ParentNode): () => void;
