/*
    Copyright © 2020, Inochi2D Project
    Distributed under the 2-Clause BSD License, see LICENSE file.
    
    Authors: Luna Nielsen
*/

import { Transform } from "../math/transform";
import * as THREE from "three";
import { blend_modes } from "../renderer/renderer";

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
 * Represents the joint binding data.
 */
export class JointBindingData {
    bound_to: NodeUuid = -1;
    bind_data: number[][] = [];
}

/**
 * Represents the Inox Node UUID.
 */
export type NodeUuid = number;

/**
 * Base type for all nodes.
 */
export class Node {
    // Serialised models
    type: string = "";
    uuid: NodeUuid = -1;
    name?: string;
    enabled: boolean = true;
    zsort: number = 0;
    transform: Transform = new Transform();
    children: Node[] = [];

    // Non-serialisables
    threeObj: THREE.Object3D | THREE.Mesh = new THREE.Object3D();   // three.JS Node for rendering.
    parent: Node | null = null;                                     // Track the parent for easy traversal.
    lockToRoot: boolean = false;                                    // Whether to lock to root
    actualTransform: Transform = new Transform();                   // Track absolute transform  
    actualZsort: number = 0;                                        // Track absolute z-index

    /**
     * Calculates the transform of this node.
     */
    updateTransform() {
        // Update transform
        this.transform.update();

        // Update the absolute transform
        if (this.parent == null) {
            // No parent, use current transform
            this.actualTransform = this.transform;
            this.actualZsort = this.zsort;
        } else {
            // Otherwise, translate, rotate & scale current transform to the parent's
            const newTransform = new Transform();
            newTransform.rot = this.parent.actualTransform.rot.clone().add(this.transform.rot);
            newTransform.trans = this.parent.actualTransform.trans.clone().add(this.transform.trans);
            newTransform.scale = new THREE.Vector2(this.parent.actualTransform.scale.x * this.transform.scale.x,
                this.parent.actualTransform.scale.y * this.transform.scale.y);

            // Set the transform
            this.actualTransform = newTransform;
            this.actualZsort = this.parent.actualZsort + this.zsort;
        }

        // Update the three object transform
        this.threeObj.position.set(this.transform.trans.x, this.transform.trans.y, this.transform.trans.z);  
        this.threeObj.scale.set(this.transform.scale.x, this.transform.scale.y, 1); 
        this.threeObj.rotation.x = this.transform.rot.x;
        this.threeObj.rotation.y = this.transform.rot.y;
        this.threeObj.rotation.z = this.transform.rot.z;
        this.threeObj.renderOrder = -this.actualZsort;
    }

    /**
     * Called on render, populates a THREE.Object3D.
     */
    protected onCreateMesh() {}

    /**
     * Called on render, populates a THREE.Object3D materials.
     */
    protected onCreateMaterials(textures: THREE.Texture[]) {}

    /**
     * Called on update.
     */
    update() {
        this.updateTransform();
    }

    /**
     * Called on render.
     */
    create(textures: THREE.Texture[]) {
        this.onCreateMesh();
        this.onCreateMaterials(textures);
    }
}


/**
 * Represents a path deform node.
 */
export class PathDeform extends Node {
    joints: THREE.Vector2[] = [];
    bindings: JointBindingData[] = [];
}

