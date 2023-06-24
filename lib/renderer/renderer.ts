import * as THREE from "three";
import { MeshData } from "../meshdata";
import { BlendMode, Node, Part } from "../nodes/node";
import { Puppet } from "../puppet";


const blend_modes = [
    { _blendmode: BlendMode.Normal, _constant: THREE.NormalBlending },
    { _blendmode: BlendMode.Screen, _constant: THREE.NoBlending },
    { _blendmode: BlendMode.ColorDodge, _constant: THREE.NoBlending },
    { _blendmode: BlendMode.Multiply, _constant: THREE.NoBlending }
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
        console.log(blendModeData._blendmode.valueOf() + ", " + _constant.valueOf());
        const texture = textures[0]; // Using the first texture as an example
        material = new THREE.MeshBasicMaterial({ transparent: true, blending: _constant, map: texture });
    } else {
        material = new THREE.MeshBasicMaterial({ color: "pink", transparent: true, blending: _constant });
    }

    return new THREE.Mesh(geometry, material);
}

// Function to recursively add nodes to the scene
function processNode(node: Node, scene: THREE.Object3D, parent: THREE.Object3D, textures: THREE.Texture[]) {

    node.update();

    if (node instanceof Part) {
        const mesh = createPartMesh(node.mesh, node.textures.map((idx) => textures[idx]), node.blend_mode);

        mesh.position.set(node.actualTransform.trans.x, node.actualTransform.trans.y,
            (node.zsort + ((node.parent !== null) ? node.parent.zsort : 0)) * -1);
        mesh.rotation.x = node.actualTransform.rot.x;
        mesh.rotation.y = node.actualTransform.rot.y;
        mesh.rotation.z = node.actualTransform.rot.z;
        mesh.scale.set(node.actualTransform.scale.x, node.actualTransform.scale.y, 1);

        scene.add(mesh);
    }

    const threeNode = new THREE.Object3D();

    parent.add(threeNode);

    // Process child nodes
    for (let child of node.children) {
        processNode(child, scene, threeNode, textures);
    }

    return threeNode;
}


// Function to render a Puppet
export function renderPuppet(puppet: Puppet, scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.Renderer) {
    // Process root node
    let rootNode = processNode(puppet.nodes, scene, scene, puppet.textures);
    scene.add(rootNode);

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
