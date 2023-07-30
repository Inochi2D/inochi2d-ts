/*
    Testing script.

    Copyright © 2023, Inochi2D Project
    Distributed under the 2-Clause BSD License, see LICENSE file.
    
    Authors: FartDraws
*/

import * as Inochi2D from '../main'
import * as THREE from 'three';

const scene = new THREE.Scene();
const aspectRatio = window.innerWidth / window.innerHeight;

// Set up the parameters for the orthographic camera
const cameraWidth = 6000; // Width of the camera view
const cameraHeight = cameraWidth / aspectRatio; // Height of the camera view
const camera = new THREE.OrthographicCamera(
    cameraWidth / -2,
    cameraWidth / 2,
    cameraHeight / 2,
    cameraHeight / -2,
    0.01,
    10000
);

// Set camera position
camera.position.set(0, 1, 500);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const puppet = await Inochi2D.INP.inImportFromURL('Aka.inx')

console.log("Loaded " + puppet.meta + "!");

// Render the puppet
const puppetObject = Inochi2D.Renderer.renderPuppet(puppet, scene, camera, renderer);