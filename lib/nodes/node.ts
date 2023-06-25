/*
    Copyright © 2020, Inochi2D Project
    Distributed under the 2-Clause BSD License, see LICENSE file.
    
    Authors: Luna Nielsen
*/

import { Transform, deserializeTransform } from "../math/transform";
import { MeshData } from "../meshdata";
import { Vector2 } from "three";

/**
 * Blending mode.
 */
export enum BlendMode {
    /**
     * Normal blending mode.
     */
    Normal,
    /**
     * Multiply blending mode.
     */
    Multiply,
    /**
     * Color Dodge.
     */
    ColorDodge,
    /**
     * Linear Dodge.
     */
    LinearDodge,
    /**
     * Screen.
     */
    Screen,
    /**
     * Clip to Lower.
     * Special blending mode that clips the drawable to a lower rendered area.
     */
    ClipToLower,
    /**
     * Slice from Lower.
     * Special blending mode that slices the drawable via a lower rendered area.
     * (Basically inverse ClipToLower.)
     */
    SliceFromLower,
}

/**
 * Represents the masking mode.
 */
export enum MaskingMode {
    Mask,
    Dodge,
}

/**
 * Represents the Inox Node UUID.
 */
export type NodeUuid = number;

/**
 * Base type for all nodes.
 */
export class Node {
    type: string = "";
    uuid: NodeUuid = -1;
    name?: string;
    enabled: boolean = true;
    zsort: number = 0;
    transform: Transform = new Transform();
    children: Node[] = [];

    // Private non-serialisables
    parent: Node | null = null;
    lockToRoot: boolean = false;
    actualTransform: Transform = new Transform();
    actualZsort: number = 0;

    /**
     * Calculates the transform of this node.
     */
    updateTransform() {
        // Update transforms
        this.transform.update();

        // If this has a parent, orient transform in relation to parent
        if (this.parent == null) {
            this.actualTransform = this.transform;
            this.actualZsort = this.zsort;
        } else {
            const newTransform = new Transform();
            newTransform.rot = this.parent.actualTransform.rot.clone().add(this.transform.rot);
            newTransform.trans = this.parent.actualTransform.trans.clone().add(this.transform.trans);
            newTransform.scale = new Vector2(this.parent.actualTransform.scale.x * this.transform.scale.x,
                this.parent.actualTransform.scale.y * this.transform.scale.y);

            this.actualTransform = newTransform;
            this.actualZsort = this.parent.actualZsort + this.zsort;
        }
    }

    /**
     * Cycles a node.
     */
    update() {
        this.updateTransform();
    }
}

/**
 * Represents the drawable properties.
 */
export class Drawable extends Node {
    mesh: MeshData = new MeshData();
}

/**
 * Represents a part with additional properties.
 */
export class Part extends Drawable {
    textures: number[] = [];
    opacity: number = 1;
    mask_mode: MaskingMode = MaskingMode.Mask;
    mask_threshold: number = 0;
    masked_by: NodeUuid[] = [];
    blend_mode: BlendMode = BlendMode.Normal;
}

/**
 * Represents a mask with the same properties as a drawable.
 */
export class Mask extends Drawable { }

/**
 * Represents a path deform node.
 */
export class PathDeform extends Node {
    joints: Vector2[] = [];
    bindings: JointBindingData[] = [];
}

/**
 * Represents the joint binding data.
 */
export class JointBindingData {
    bound_to: NodeUuid = -1;
    bind_data: number[][] = [];
}

function deserializeBaseProperties(json: any, node: Node): void {
    node.type = json.type;
    node.uuid = json.uuid;
    node.name = json.name;
    node.enabled = json.enabled !== undefined ? json.enabled : node.enabled;
    node.zsort = json.zsort !== undefined ? json.zsort : node.zsort;
    node.transform = json.transform !== undefined ? deserializeTransform(json.transform) : node.transform;
    node.children = json.children !== undefined ? json.children.map((child: any) => deserializeNode(child, node)) : node.children;
    node.lockToRoot = json.children !== undefined ? json.lockToRoot : node.lockToRoot;
}

function deserializeDrawable(json: any, drawable: Drawable): Drawable {
    deserializeBaseProperties(json, drawable);
    // Deserialize additional properties specific to Drawable
    drawable.mesh = MeshData.deserialize(json.mesh);
    return drawable;
}

function deserializePart(json: any): Part {
    const part = new Part();
    deserializeDrawable(json, part);
    // Deserialize additional properties specific to Part
    part.textures = json.textures;
    part.opacity = json.opacity;
    part.mask_mode = json.mask_mode;
    part.mask_threshold = json.mask_threshold;
    part.masked_by = json.masked_by;

    if (json.blend_mode)
        switch (json.blend_mode) {
            case "Multiply":
                part.blend_mode = BlendMode.Multiply;
                break;
            case "ColorDodge":
                part.blend_mode = BlendMode.ColorDodge;
                break;
            case "LinearDodge":
                part.blend_mode = BlendMode.LinearDodge;
                break;
            case "Screen":
                part.blend_mode = BlendMode.Screen;
                break;
            default:
                part.blend_mode = BlendMode.Normal;
        }

    return part;
}

function deserializeMask(json: any): Mask {
    const mask = new Mask();
    deserializeDrawable(json, mask);
    // Deserialize additional properties specific to Mask
    return mask;
}

function deserializePathDeform(json: any): PathDeform {
    const pathDeform = new PathDeform();
    deserializeBaseProperties(json, pathDeform);
    // Deserialize additional properties specific to PathDeform
    pathDeform.joints = json.joints;
    pathDeform.bindings = json.bindings;
    return pathDeform;
}

function deserializeCustomNode(json: any): Node {
    const node = new Node();
    deserializeBaseProperties(json, node);
    return node;
}

/**
 * Deserializes a JSON object into the appropriate subclass based on the "type" property.
 * @param json - The JSON object to deserialize.
 * @param parent - The Node that may have called this.
 * @returns The deserialized object as the correct subclass.
 */
export function deserializeNode(json: any, parent: Node | null = null): Node {
    let result = new Node();
    switch (json.type) {
        case "Part":
            result = deserializePart(json);
            break;
        case "Mask":
            result = deserializeMask(json);
            break;
        case "PathDeform":
            result = deserializePathDeform(json);
            break;
        default:
            result = deserializeCustomNode(json);
            break;
    }

    // Set the parent
    result.parent = parent;

    return result;
}

/**
 * Serializes a Node object into a JSON object with the specified properties.
 * @param node - The Node object to serialize.
 * @returns The serialized JSON object.
 */
export function serializeNode(node: Node): any {
    const data: any = {};

    data.type = node.type;
    data.uuid = node.uuid;
    data.name = node.name;
    data.enabled = node.enabled;
    data.zsort = node.zsort;
    data.transform = node.transform;
    data.children = node.children.map(child => serializeNode(child,));
    data.lockToRoot = node.lockToRoot;

    if (node instanceof Drawable) {
        data.mesh = node.mesh;
    }

    if (node instanceof Part) {
        data.textures = node.textures;
        data.opacity = node.opacity;
        data.mask_mode = node.mask_mode;
        data.mask_threshold = node.mask_threshold;
        data.masked_by = node.masked_by;
    }

    if (node instanceof PathDeform) {
        data.joints = node.joints;
        data.bindings = node.bindings;
    }

    return data;
}
