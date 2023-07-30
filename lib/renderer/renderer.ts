/*
    THREE.JS-based renderer

    Copyright © 2023, Inochi2D Project
    Distributed under the 2-Clause BSD License, see LICENSE file.
    
    Authors: FartDraws
*/

import * as THREE from "three";
import { BlendMode, Node } from "../nodes/node";
import { Drawable, Part } from "../nodes/drawable";
import { Puppet } from "../puppet";


export const blend_modes = [
    { _blendmode: BlendMode.Normal, _constant: THREE.NormalBlending },
    { _blendmode: BlendMode.Screen, _constant: THREE.MultiplyBlending  },
    { _blendmode: BlendMode.ColorDodge, _constant: THREE.MultiplyBlending },
    { _blendmode: BlendMode.Multiply, _constant: THREE.MultiplyBlending }
];

// Function to recursively add nodes to the scene
function createNode(node: Node | Drawable, scene: THREE.Object3D, parent: THREE.Object3D, textures: THREE.Texture[]) {
    node.create();
    node.update();
    parent.add(node.threeObj);

    // Process child nodes
    for (let child of node.children) {
        createNode(child, scene, node.threeObj, textures);
    }
        
    return node.threeObj;
}

// Function to render a Puppet
export function renderPuppet(puppet: Puppet, scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.Renderer) {
    // Process root node
    let rootNode = createNode(puppet.rootNode, scene, scene, puppet.textures);
    scene.add(rootNode);

    // Render loop
    const animate = function () {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };

    animate();

    return {
        rootNode: rootNode, 
        animate: animate
    };
}
