/*
    Node Tree

    Translated from work in Inox2D by @Speykious

    Copyright © 2022, Inochi2D Project
    Distributed under the 2-Clause BSD License, see LICENSE file.
    
    Authors: Speykious
*/

import { Node, NodeUuid } from "./node";

/**
 * Generates a unique UUID within the context of an InoxNodeTree.
 * @param tree - The InoxNodeTree.
 * @returns A unique UUID.
 */
export function generateUniqueUuid(tree: NodeTree): NodeUuid {
    let uuid: NodeUuid;
    do {
        uuid = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    } while (tree.getNode(uuid) !== undefined);
    return uuid;
}

/**
 * Represents an Inox node tree.
 */
export class NodeTree {
    /**
     * The UUID of the root node in the tree.
     */
    public root: NodeUuid;

    /**
     * A record of nodes in the tree, indexed by their UUIDs.
     */
    public nodes: Record<NodeUuid, Node>;

    /**
     * Constructs a new NodeTree instance.
     * @param root - The UUID of the root node.
     * @param nodes - A record of nodes in the tree.
     */
    constructor(root: NodeUuid, nodes: Record<NodeUuid, Node>) {
        this.root = root;
        this.nodes = nodes;
    }

    /**
     * Retrieves a node from the tree based on its UUID.
     * @param uuid - The UUID of the node.
     * @returns The node with the corresponding UUID, or undefined if not found.
     */
    public getNode(uuid: NodeUuid): Node | undefined {
        return this.nodes[uuid];
    }

    /**
     * Retrieves a mutable reference to a node from the tree based on its UUID.
     * @param uuid - The UUID of the node.
     * @returns The mutable reference to the node with the corresponding UUID, or undefined if not found.
     */
    public getNodeMut(uuid: NodeUuid): Node | undefined {
        return this.nodes[uuid];
    }

    /**
     * Retrieves the parent node of a given node in the tree.
     * @param uuid - The UUID of the node.
     * @returns The parent node of the node with the corresponding UUID, or undefined if not found.
     * ! TODO: Implement parent tracking!
     */
    public getParent(uuid: NodeUuid): Node | undefined {
        throw new Error("Not implemented.");
    }

    /**
     * Retrieves the UUIDs of the children nodes of a given node in the tree.
     * @param uuid - The UUID of the node.
     * @returns An array of UUIDs representing the children nodes of the node with the corresponding UUID, or undefined if not found.
     */
    public getChildrenUuids(uuid: NodeUuid): Node[] | undefined {
        const node = this.getNode(uuid);
        if (node !== undefined) {
            return node.children;
        }
        return undefined;
    }

    private recAllChildrenFromNode(
        node: Node,
        zsort: number,
        skipComposites: boolean
    ): [NodeUuid, number][] {
        const nodeState = node;
        const currentZsort = zsort + nodeState.zsort;
        const result: [NodeUuid, number][] = [[nodeState.uuid, currentZsort]];

        if (!skipComposites || !(node.type !== "Composite")) {
            for (const child of node.children) {
                if (child !== undefined) {
                    result.push(...this.recAllChildrenFromNode(child, currentZsort, skipComposites));
                }
            }
        }

        return result;
    }

    private sortByZsort(node: Node, skipComposites: boolean): NodeUuid[] {
        const uuidZsorts = this.recAllChildrenFromNode(node, 0, skipComposites);
        uuidZsorts.sort((a, b) => b[1] - a[1]);
        return uuidZsorts.map(([uuid]) => uuid);
    }

    /**
     * Retrieves the UUIDs of the nodes in the tree, sorted in z-order (front-to-back).
     * @returns An array of UUIDs representing the nodes in z-order.
     */
    public zsortedRoot(): NodeUuid[] {
        const rootNode = this.getNode(this.root);
        if (rootNode !== undefined) {
            return this.sortByZsort(rootNode, true);
        }
        return [];
    }

    /**
     * Retrieves the UUIDs of the child nodes of a given node, sorted in z-order (front-to-back).
     * @param id - The UUID of the node.
     * @returns An array of UUIDs representing the child nodes of the node in z-order.
     */
    public zsortedChild(id: NodeUuid): NodeUuid[] {
        const node = this.getNode(id);
        if (node !== undefined) {
            return this.sortByZsort(node, false);
        }
        return [];
    }

    /**
     * Retrieves the UUIDs of all the nodes in the tree.
     * @returns An array of UUIDs representing all the nodes in the tree.
     */
    public allNodeUuids(): NodeUuid[] {
        return Object.keys(this.nodes).map((uuid) => Number(uuid));
    }

    /**
     * Returns a string representation of the node tree.
     * @returns A string representation of the node tree.
     */
    public toString(): string {
        const rootNode = this.getNode(this.root);
        if (rootNode === undefined) {
            return '(empty)';
        }

        const formattedTree: string[] = [];
        const indent = (level: number) => '  '.repeat(level);

        const recFmt = (node: Node, level: number): void => {
            const typeName = node.type;
            // Add optional formatting or colorization if desired

            formattedTree.push(`${indent(level)}- [${typeName}] ${node.name}`);
            for (const child of node.children) {
                if (child !== undefined) {
                    recFmt(child, level + 1);
                }
            }
        };

        formattedTree.push(`- [${rootNode.type}] ${rootNode.name}`);
        for (const child of rootNode.children) {
            if (child !== undefined) {
                recFmt(child, 1);
            }
        }

        return formattedTree.join('\n');
    }
}
