/*
    Copyright © 2020, Inochi2D Project
    Distributed under the 2-Clause BSD License, see LICENSE file.
    
    Authors: Luna Nielsen
*/
// import * as THREE from 'three';
import { Transform } from "../math/transform";

/**
 * Basetype for all nodes
*/
export
class Node {
    children: Node[] = new Array<Node>(0);
    enabled: boolean = true;
    lockToRoot: boolean = false;
    name: string = "";
    transform: Transform = new Transform();
}