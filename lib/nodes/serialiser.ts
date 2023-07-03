import { deserializeTransform } from "../math/transform";
import { MeshData } from "../meshdata";
import { Node, BlendMode, PathDeform } from "./node";
import { Drawable, Part, Mask } from "./drawable";

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
    data.children = node.children.map(child => serializeNode(child));
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
