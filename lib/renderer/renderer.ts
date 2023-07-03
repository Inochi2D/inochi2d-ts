/*
    THREE.JS-based renderer

    Copyright © 2023, Inochi2D Project
    Distributed under the 2-Clause BSD License, see LICENSE file.
    
    Authors: FartDraws
*/

import * as THREE from "three";
import { BlendMode, Node } from "../nodes/node";
import { Part } from "../nodes/drawable";
import { Puppet } from "../puppet";


export const blend_modes = [
    { _blendmode: BlendMode.Normal, _constant: THREE.NormalBlending },
    { _blendmode: BlendMode.Screen, _constant: THREE.MultiplyBlending  },
    { _blendmode: BlendMode.ColorDodge, _constant: THREE.MultiplyBlending },
    { _blendmode: BlendMode.Multiply, _constant: THREE.MultiplyBlending }
];

// Function to create a mesh from MeshData
function shadePartMesh(textures: THREE.Texture[], blend_mode: BlendMode) {
    // Set material with textures
    let material;

    // Set blending mode
    let blendModeData = blend_modes.find(modeData => modeData._blendmode === blend_mode);
    if (blendModeData === undefined) blendModeData = { _blendmode: BlendMode.Normal, _constant: THREE.NormalBlending };
    const { _constant } = blendModeData;

    // If there's textures
    if (textures) {
        // console.log(blendModeData._blendmode.valueOf() + ", " + _constant.valueOf());
        const texture = textures[0]; // Using the first texture as an example

        material = new THREE.MeshBasicMaterial({ transparent: true, blending: _constant, map: texture, depthWrite: false });

        if (_constant != THREE.NormalBlending)
            material.opacity = 0;

    } else {
        material = new THREE.MeshBasicMaterial({ color: "pink", transparent: true, blending: _constant });
    }

    return material;
}

let biggest_z_val = 0;
let smallest_z_val = 0;

// Function to recursively add nodes to the scene
function createNode(node: Node, scene: THREE.Object3D, parent: THREE.Object3D, textures: THREE.Texture[]) {
    node.create(textures);
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
    let rootNode = createNode(puppet.nodes, scene, scene, puppet.textures);
    scene.add(rootNode);

    console.log("Loaded THREE.JS renderables. " + biggest_z_val + ", " + smallest_z_val);

    // Render loop
    const animate = function () {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };

    animate();
}
