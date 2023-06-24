/*
    Copyright © 2020, Inochi2D Project
    Distributed under the 2-Clause BSD License, see LICENSE file.
    
    Authors: Luna Nielsen
*/
// import * as THREE from 'three';
import { Transform } from "../math/transform";

/**
 * Represents the Inox Node UUID.
 */
export type NodeUuid = number;

/**
 * Basetype for all nodes
 */
export class Node {
    type: string = "";
    uuid: NodeUuid = -1;
    name?: string;
    enabled: boolean = true;
    zsort: number = 0;
    transform: Transform = new Transform();
    children: Node[] = new Array<Node>(0);
    lockToRoot: boolean = false;
}