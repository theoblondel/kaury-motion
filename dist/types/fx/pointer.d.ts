import { type Targets } from '../core/animate';
export interface MagneticOptions {
    /** Share of the pointer offset the element follows. Default 0.4. */
    strength?: number;
    /** Extra reach around the element, px. Default 80. */
    radius?: number;
    /** Follow speed; higher is snappier. Default 10. */
    stiffness?: number;
    /** A child that moves further, for a layered parallax feel. */
    inner?: string;
}
/** Buttons and icons that lean towards the cursor and snap back. */
export declare function magnetic(targets: Targets, opts?: MagneticOptions): () => void;
export interface TiltOptions {
    /** Max rotation in degrees. Default 14. */
    max?: number;
    perspective?: number;
    /** Scale while hovered. Default 1.04. */
    scale?: number;
    /** Adds a moving light reflection. Default true. */
    glare?: boolean;
    stiffness?: number;
}
/** 3D cards that tilt towards the pointer, with a travelling glare. */
export declare function tilt(targets: Targets, opts?: TiltOptions): () => void;
export interface CursorOptions {
    size?: number;
    color?: string;
    /** Blend mode; 'difference' inverts whatever is underneath. */
    blend?: string;
    /** Scale over links, buttons and [data-km-cursor]. Default 3.2. */
    hoverScale?: number;
    stiffness?: number;
}
/** A custom cursor that trails the pointer, grows over links and shows labels from `data-km-cursor`. */
export declare function cursor(opts?: CursorOptions): () => void;
