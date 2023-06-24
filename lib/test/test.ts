import * as Inochi2D from '../main'
import * as THREE from 'three';
import { renderPuppet } from '../renderer/renderer';

const scene = new THREE.Scene();
const aspectRatio = window.innerWidth / window.innerHeight;

// Set up the parameters for the orthographic camera
const cameraWidth = 10000; // Width of the camera view
const cameraHeight = cameraWidth / aspectRatio; // Height of the camera view
const camera = new THREE.OrthographicCamera(
    cameraWidth / -2,
    cameraWidth / 2,
    cameraHeight / 2,
    cameraHeight / -2,
    0.1,
    100000
);

// Set camera position
camera.position.set(0, 1, 5);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


async function downloadFile(url: string): Promise<Uint8Array> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer)
    return uint8Array;
}

const puppet = await Inochi2D.INP.inImport(await (downloadFile('Aka.inx')))

console.log("Loaded " + puppet.meta + "!");

// Render the puppet
renderPuppet(puppet, scene, camera, renderer);