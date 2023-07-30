import { deserializeTransform } from "../math/transform";
import { MeshData } from "../meshdata";
import { Node, BlendMode, PathDeform } from "./node";
import { Drawable, Part, Mask, MaskData } from "./drawable";

function deserializeBaseProperties(puppet: any, json: any, node: Node) {
    node.puppet = puppet;
    node.type = json.type;
    node.uuid = json.uuid;
    node.name = json.name;
    node.enabled = json.enabled !== undefined ? json.enabled : node.enabled;
    node.zsort = json.zsort !== undefined ? json.zsort : node.zsort;
    node.transform = json.transform !== undefined ? deserializeTransform(json.transform) : node.transform;
    node.children = json.children !== undefined ? json.children.map((child: any) => deserializeNode(puppet, child, node)) : node.children;
    node.lockToRoot = json.children !== undefined ? json.lockToRoot : node.lockToRoot;

    return node;
}

function deserializeDrawable(puppet: any, json: any, drawable: Drawable): Drawable {
    drawable = deserializeBaseProperties(puppet, json, drawable) as Drawable;

    // Deserialize additional properties specific to Drawable
    drawable.mesh = MeshData.deserialize(json.mesh);

    // Populate the masks
    drawable.masks = json.masks !== undefined ? json.masks.map((mask: any) => {
        const maskData : MaskData = new MaskData();
        // Populate mode
        if (mask.mode)
            switch (json.blend_mode) {
                case "Mask":
                    maskData.mode = BlendMode.ClipToLower;
                    break;
                case "Dodge":
                    maskData.mode = BlendMode.SliceFromLower;
                    break;
                default:
                    maskData.mode = BlendMode.Normal;
            }
        // Populate source
        maskData.source = mask.source;
        return maskData
    }) : drawable.children;

    return drawable;
}

function deserializePart(puppet: any, json: any): Part {
    let part = new Part();
    part = deserializeDrawable(puppet, json, part) as Part;

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

function deserializeMask(puppet: any, json: any): Mask {
    let mask = new Mask();
    mask = deserializeDrawable(puppet, json, mask) as Mask;
    console.log("Serialised a mask");

    // Deserialize additional properties specific to Mask
    return mask;
}

function deserializePathDeform(puppet: any, json: any): PathDeform {
    let pathDeform = new PathDeform();
    pathDeform = deserializeBaseProperties(puppet, json, pathDeform) as PathDeform;

    // Deserialize additional properties specific to PathDeform
    pathDeform.joints = json.joints;
    pathDeform.bindings = json.bindings;
    return pathDeform;
}

function deserializeCustomNode(puppet: any, json: any): Node {
    let node = new Node();
    node = deserializeBaseProperties(puppet, json, node);
    return node;
}

/**
 * Deserializes a JSON object into the appropriate subclass based on the "type" property.
 * @param json - The JSON object to deserialize.
 * @param parent - The Node that may have called this.
 * @returns The deserialized object as the correct subclass.
 */
export function deserializeNode(puppet: any, json: any, parent: Node | null = null): Node {
    let result = new Node();
    switch (json.type) {
        case "Part":
            result = deserializePart(puppet, json);
            break;
        case "Mask":
            result = deserializeMask(puppet, json);
            break;
        case "PathDeform":
            result = deserializePathDeform(puppet, json);
            break;
        default:
            result = deserializeCustomNode(puppet, json);
            break;
    }

    // Set the parent
    result.parent = parent;

    // Add this node to the puppet
    puppet.nodes.push(result);

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
