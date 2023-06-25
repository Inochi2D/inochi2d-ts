/*
    THREE.JS-based renderer

    Copyright © 2023, Inochi2D Project
    Distributed under the 2-Clause BSD License, see LICENSE file.
    
    Authors: FartDraws
*/

import * as THREE from "three";
import { MeshData } from "../meshdata";
import { BlendMode, Node, Part } from "../nodes/node";
import { Puppet } from "../puppet";


const blend_modes = [
    { _blendmode: BlendMode.Normal, _constant: THREE.NormalBlending },
    { _blendmode: BlendMode.Screen, _constant: THREE.MultiplyBlending  },
    { _blendmode: BlendMode.ColorDodge, _constant: THREE.MultiplyBlending },
    { _blendmode: BlendMode.Multiply, _constant: THREE.MultiplyBlending }
];

// Function to create a mesh from MeshData
function createPartMesh(meshData: MeshData, textures: THREE.Texture[], blend_mode: BlendMode) {
    const geometry = new THREE.BufferGeometry();

    // Set vertices
    const vertices = [];
    for (let vertex of meshData.vertices) {
        const offset : THREE.Vector2 = meshData.origin ? meshData.origin : new THREE.Vector2(0,0);
        vertices.push(vertex.x + offset.x, vertex.y + offset.y, 0);
    }

    const positionNumComponents = 3;
    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(vertices), positionNumComponents));

    // Set UVs if available
    if (meshData.uvs) {
        const uvs = [];
        for (let uv of meshData.uvs) {
            uvs.push(uv.x, uv.y);
        }
        const uvNumComponents = 2;
        geometry.setAttribute(
            'uv',
            new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
    }

    // Set indices
    geometry.setIndex(meshData.indices);

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

        material = new THREE.MeshBasicMaterial({ transparent: true, blending: _constant, map: texture });

        if (_constant != THREE.NormalBlending)
            material.opacity = 0;

    } else {
        material = new THREE.MeshBasicMaterial({ color: "pink", transparent: true, blending: _constant });
    }

    return new THREE.Mesh(geometry, material);
}

let biggest_z_val = 0;
let smallest_z_val = 0;

// Function to recursively add nodes to the scene
function processNode(node: Node, scene: THREE.Object3D, parent: THREE.Object3D, textures: THREE.Texture[]) {
    node.update();
    let obj : THREE.Object3D = new THREE.Object3D();

    // Set parts
    if (node instanceof Part) {
        obj = createPartMesh(node.mesh, node.textures.map((idx) => textures[idx]), node.blend_mode);
    } 

    // Materials settings
    if (obj instanceof THREE.Mesh) {
        if (!node.enabled) obj.material.opacity = 0;
        obj.material.alphaTest = 0.7;
    }

    // Set transform
    biggest_z_val = Math.max(node.transform.trans.z, biggest_z_val);
    smallest_z_val = Math.min(node.transform.trans.z, smallest_z_val);
    obj.position.set(node.transform.trans.x, node.transform.trans.y, -node.zsort);  // Enforce z-index in position
    obj.scale.set(node.transform.scale.x, node.transform.scale.y, 1);               // Enforce z-index in render order
    obj.rotation.x = node.transform.rot.x;
    obj.rotation.y = node.transform.rot.y;
    obj.rotation.z = node.transform.rot.z;
    obj.renderOrder = -node.zsort;
    parent.add(obj);

    // Process child nodes
    for (let child of node.children) {
        processNode(child, scene, obj, textures);
    }
        
    return obj;
}


// Function to render a Puppet
export function renderPuppet(puppet: Puppet, scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.Renderer) {
    // Process root node
    let rootNode = processNode(puppet.nodes, scene, scene, puppet.textures);
    scene.add(rootNode);

    console.log("Loaded THREE.JS renderables. " + biggest_z_val + ", " + smallest_z_val);

    let grid = new THREE.GridHelper(30, 30, 0xffffff, 0x404040);
    grid.rotation.x = Math.PI * 0.5;
    scene.add(grid);

    // Render loop
    const animate = function () {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };

    animate();
}
