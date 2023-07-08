# Three.js Inochi2D

A three.js implementation of Inochi2D, do note that I am not a javascript/ts developer, so the quality of the code may be subpar.
Contributions are welcome!

## Usage

```ts
import * as THREE from 'three';
import * as Inochi2D from 'inochi2d';

// Set up a Three.JS scene, camera and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Download and load the puppet
const puppet = await Inochi2D.INP.inImportFromURL('Aka.inx')

// Render the puppet, and add the renderer
const puppetObject = Inochi2D.Renderer.renderPuppet(puppet, scene, camera, renderer);
```
