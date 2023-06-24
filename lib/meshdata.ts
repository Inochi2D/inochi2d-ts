/* 
    Inochi2D Part Mesh Data

    Translated from work in Inochi2D by Luna Nielsen
    
    Copyright © 2020, Inochi2D Project
    Distributed under the 2-Clause BSD License, see LICENSE file.
    
    Authors: Luna Nielsen
 */

import { Vector2, Vector4 } from 'three';

/**
 * Mesh data
 */
class MeshData {
    /**
     * Vertices in the mesh
     */
    vertices: Vector2[];

    /**
     * Base uvs
     */
    uvs?: Vector2[];

    /**
     * Indices in the mesh
     */
    indices: number[];

    /**
     * Origin of the mesh
     */
    origin?: Vector2;

    gridAxes?: number[][];

    /**
     * Creates a new MeshData object.
     */
    constructor() {
        this.vertices = [];
        this.indices = [];
        this.origin = new Vector2(0, 0);
    }

    /**
     * Adds a new vertex.
     * @param vertex The vertex position.
     * @param uv The UV coordinates.
     */
    add(vertex: Vector2, uv: Vector2): void {
        this.vertices.push(vertex);
        if (this.uvs) {
            this.uvs.push(uv);
        }
    }

    /**
     * Clears connections/indices.
     */
    clearConnections(): void {
        this.indices.length = 0;
    }

    /**
     * Connects two vertices together.
     * @param first The index of the first vertex.
     * @param second The index of the second vertex.
     */
    connect(first: number, second: number): void {
        this.indices.push(first, second);
    }

    /**
     * Finds the index of a vertex.
     * @param vert The vertex position to find.
     * @returns The index of the vertex, or -1 if not found.
     */
    find(vert: Vector2): number {
        for (let idx = 0; idx < this.vertices.length; idx++) {
            const v = this.vertices[idx];
            if (v.equals(vert)) {
                return idx;
            }
        }
        return -1;
    }

    /**
     * Checks if the mesh data is ready to be used.
     * @returns True if the mesh data is ready, false otherwise.
     */
    isReady(): boolean {
        return this.indices.length !== 0 && this.indices.length % 3 === 0;
    }

    /**
     * Checks if the mesh data is ready to be triangulated.
     * @returns True if the mesh data is ready to be triangulated, false otherwise.
     */
    canTriangulate(): boolean {
        return this.isReady();
    }

    /**
     * Fixes the winding order of the mesh to ensure consistent face orientation.
     * This method checks the winding of each triangle in the mesh and swaps the second and third vertices if the winding is clockwise.
     * It ensures that all triangles have a consistent and desirable orientation for proper rendering and visual appearance.
     */
    fixWinding(): void {
        if (!this.isReady()) return; // If the mesh is not ready (i.e., indices array is empty or not divisible by 3), return

        for (let j = 0; j < this.indices.length; j += 3) {
            const i = j;
            const vertA = this.vertices[this.indices[i + 0]];   // Get the first vertex of the triangle
            const vertB = this.vertices[this.indices[i + 1]];   // Get the second vertex of the triangle
            const vertC = this.vertices[this.indices[i + 2]];   // Get the third vertex of the triangle

            // Calculate the cross product of two edges of the triangle to determine its winding direction
            // If the z-component of the cross product is negative, the winding is clockwise; otherwise, it is counterclockwise
            const cw =
                (vertB.x - vertA.x) * (vertC.y - vertA.y) -
                (vertB.y - vertA.y) * (vertC.x - vertA.x) < 0;

            // Swap winding if clockwise
            if (cw) {
                const swap = this.indices[i + 1];           // Store the index of the second vertex temporarily
                this.indices[i + 1] = this.indices[i + 2];  // Assign the index of the third vertex to the second vertex
                this.indices[i + 2] = swap;                 // Assign the stored index (second vertex) to the third vertex
            }
        }
    }


    /**
     * Gets the number of connections at a certain vertex.
     * @param point The index of the vertex.
     * @returns The number of connections at the vertex.
     */
    connectionsAtPoint(point: number): number {
        let found = 0;
        for (const index of this.indices) {
            if (index === point) {
                found++;
            }
        }
        return found;
    }

    /**
     * Creates a copy of the MeshData object.
     * @returns The copied MeshData object.
     */
    copy(): MeshData {
        const newData = new MeshData();

        // Copy verts
        newData.vertices = this.vertices.slice();

        // Copy UVs
        if (this.uvs) {
            newData.uvs = this.uvs.slice();
        }

        // Copy indices
        newData.indices = this.indices.slice();

        // Copy origin
        newData.origin = new Vector2(this.origin!.x, this.origin!.y);

        return newData;
    }

    /**
     * Generates a quad-based mesh that is subdivided `cuts` number of times.
     * @param size The size of the mesh.
     * @param uvBounds The UV coordinates and dimensions in UV coordinate space.
     * @param cuts The number of subdivisions to be made in the mesh.
     * @param origin The origin of the mesh.
     * @returns The generated MeshData object.
     *
     * Example usage:
     * ```typescript
     * MeshData.createQuadMesh(
     *   new Vector2(10, 10),
     *   new Vector4(0, 0, 1, 1),
     *   new Vector2(6, 6),
     *   new Vector2(0, 0)
     * );
     * ```
     */
    static createQuadMesh(
        size: Vector2,
        uvBounds: Vector4,
        cuts: Vector2 = new Vector2(6, 6),
        origin: Vector2 = new Vector2(0, 0)
    ): MeshData {
        // Ensure minimum values for subdivisions
        cuts.x = Math.max(2, cuts.x);
        cuts.y = Math.max(2, cuts.y);

        const data = new MeshData();    // Create a new MeshData object
        const m: Map<[number, number], number> = new Map();     // Map to store vertex indices
        const sw = size.x / cuts.x;     // Width of each subdivision
        const sh = size.y / cuts.y;     // Height of each subdivision
        const uvx = uvBounds.z / cuts.x;    // UV increment for x direction
        const uvy = uvBounds.w / cuts.y;    // UV increment for y direction

        // Generate vertices and UVs
        for (let y = 0; y < cuts.y + 1; y++) {
            if (!data.gridAxes) data.gridAxes = [[]];   // Initialize gridAxes if it doesn't exist
            data.gridAxes[0].push(y * sh - origin.y);   // Add the y-coordinate to gridAxes[0]
            for (let x = 0; x < cuts.x + 1; x++) {
                if (!data.gridAxes[1]) data.gridAxes[1] = [];   // Initialize gridAxes[1] if it doesn't exist
                data.gridAxes[1].push(x * sw - origin.x);       // Add the x-coordinate to gridAxes[1]
                const vertex = new Vector2(x * sw - origin.x, y * sh - origin.y); // Create a new vertex
                const uv = new Vector2(
                    uvBounds.x + x * uvx,   // Calculate the x-coordinate of the UV
                    uvBounds.y + y * uvy    // Calculate the y-coordinate of the UV
                );
                data.vertices.push(vertex); // Add the vertex to the vertices array
                if (data.uvs) {
                    data.uvs.push(uv);  // Add the UV to the uvs array if it exists
                }
                m.set([x, y], data.vertices.length - 1);    // Store the vertex index in the map
            }
        }

        // Generate indices
        const center = new Vector2(
            Math.floor(cuts.x / 2),     // Calculate the x-coordinate of the center
            Math.floor(cuts.y / 2)      // Calculate the y-coordinate of the center
        );
        for (let y = 0; y < cuts.y; y++) {
            for (let x = 0; x < cuts.x; x++) {
                const indice0: [number, number] = [x, y];           // Bottom-left vertex index
                const indice1: [number, number] = [x, y + 1];       // Top-left vertex index
                const indice2: [number, number] = [x + 1, y];       // Bottom-right vertex index
                const indice3: [number, number] = [x + 1, y + 1];   // Top-right vertex index

                // We want the vertices to generate in an X pattern so that we won't have too many distortion problems
                if ((x < center.x && y < center.y) || (x >= center.x && y >= center.y)) {
                    data.indices.push(
                        m.get(indice0)!,    // Retrieve the bottom-left vertex index
                        m.get(indice2)!,    // Retrieve the bottom-right vertex index
                        m.get(indice3)!,    // Retrieve the top-right vertex index
                        m.get(indice0)!,    // Retrieve the bottom-left vertex index
                        m.get(indice3)!,    // Retrieve the top-right vertex index
                        m.get(indice1)!     // Retrieve the top-left vertex index
                    );
                } else {
                    data.indices.push(
                        m.get(indice0)!,    // Retrieve the bottom-left vertex index
                        m.get(indice1)!,    // Retrieve the top-left vertex index
                        m.get(indice2)!,    // Retrieve the bottom-right vertex index
                        m.get(indice1)!,    // Retrieve the top-left vertex index
                        m.get(indice2)!,    // Retrieve the bottom-right vertex index
                        m.get(indice3)!     // Retrieve the top-right vertex index
                    );
                }
            }
        }

        return data; // Return the generated MeshData object
    }

    /**
     * Checks if the mesh data represents a grid.
     * @returns True if the mesh data represents a grid, false otherwise.
     */
    isGrid(): boolean {
        return (
            this.gridAxes !== undefined &&  // Check if gridAxes is defined
            this.gridAxes.length === 2 &&   // Check if gridAxes has 2 elements
            this.gridAxes[0].length > 2 &&  // Check if gridAxes[0] has more than 2 elements
            this.gridAxes[1].length > 2     // Check if gridAxes[1] has more than 2 elements
        );
    }

    /**
     * Clears the grid if it has changed.
     * @returns True if the grid was cleared, false otherwise.
     */
    clearGridIsDirty(): boolean {
        if (
            this.gridAxes === undefined ||      // Check if gridAxes is undefined
            this.gridAxes[0].length === 0 ||    // Check if gridAxes[0] has no elements
            this.gridAxes[1].length === 0       // Check if gridAxes[1] has no elements
        ) {
            return false;
        }

        const clearGrid = (): boolean => {
            this.gridAxes![0].length = 0;   // Clear gridAxes[0]
            this.gridAxes![1].length = 0;   // Clear gridAxes[1]
            return true;
        };

        if (this.vertices.length !== this.gridAxes[0].length * this.gridAxes[1].length) {
            // Check if the number of vertices has changed
            return clearGrid(); // Clear the grid if the number of vertices has changed
        }

        let index = 0;
        for (const y of this.gridAxes[0]) {
            for (const x of this.gridAxes[1]) {
                // Check if the vertex at the current index has changed
                const vert = new Vector2(x, y);
                if (!vert.equals(this.vertices[index])) {
                    return clearGrid();     // Clear the grid if the vertex has changed
                }
                index += 1;
            }
        }

        return false;
    }

    /**
     * Regenerates the grid if possible.
     * @returns True if the grid was regenerated, false otherwise.
     */
    regenerateGrid(): boolean {
        if (
            this.gridAxes === undefined ||  // Check if gridAxes is undefined
            this.gridAxes[0].length < 2 ||  // Check if gridAxes[0] has less than 2 elements
            this.gridAxes[1].length < 2     // Check if gridAxes[1] has less than 2 elements
        ) {
            return false;
        }

        this.vertices.length = 0;   // Clear the vertices array
        if (this.uvs) {
            this.uvs.length = 0;    // Clear the uvs array if it exists
        }
        this.indices.length = 0;    // Clear the indices array

        const m: Map<[number, number], number> = new Map();     // Map to store vertex indices

        const minY = this.gridAxes[0][0];                               // Minimum y-coordinate in gridAxes[0]
        const maxY = this.gridAxes[0][this.gridAxes[0].length - 1];     // Maximum y-coordinate in gridAxes[0]
        const minX = this.gridAxes[1][0];                               // Minimum x-coordinate in gridAxes[1]
        const maxX = this.gridAxes[1][this.gridAxes[1].length - 1];     // Maximum x-coordinate in gridAxes[1]
        const width = maxY - minY;      // Width of the grid
        const height = maxX - minX;     // Height of the grid

        for (let i = 0; i < this.gridAxes[0].length; i++) {
            for (let j = 0; j < this.gridAxes[1].length; j++) {
                const x = this.gridAxes[1][j];  // Retrieve the x-coordinate from gridAxes[1]
                const y = this.gridAxes[0][i];  // Retrieve the y-coordinate from gridAxes[0]
                const vertex = new Vector2(x, y);   // Create a new vertex
                const uv = new Vector2((x - minX) / width, (y - minY) / height);    // Calculate the UV coordinates
                this.vertices.push(vertex);     // Add the vertex to the vertices array
                if (this.uvs) {
                    this.uvs.push(uv);  // Add the UV coordinates to the uvs array if it exists
                }
                m.set([j, i], this.vertices.length - 1);    // Store the vertex index in the map
            }
        }

        const center = new Vector2(minX + width / 2, minY + height / 2);    // Calculate the center of the grid
        for (let i = 0; i < this.gridAxes[0].length - 1; i++) {
            const yValue = this.gridAxes[0][i];                 // Retrieve the y-coordinate value
            for (let j = 0; j < this.gridAxes[1].length - 1; j++) {
                const xValue = this.gridAxes[1][j];             // Retrieve the x-coordinate value
                const x = j; // Column index
                const y = i; // Row index

                const indice0: [number, number] = [x, y];           // Bottom-left vertex index
                const indice1: [number, number] = [x, y + 1];       // Top-left vertex index
                const indice2: [number, number] = [x + 1, y];       // Bottom-right vertex index
                const indice3: [number, number] = [x + 1, y + 1];   // Top-right vertex index

                // We want the vertices to generate in an X pattern so that we won't have too many distortion problems
                if (
                    (xValue < center.x && yValue < center.y) ||     // Check if the vertex is in the bottom-left or top-right quadrant
                    (xValue >= center.x && yValue >= center.y)      // Check if the vertex is in the bottom-right or top-left quadrant
                ) {
                    this.indices.push(
                        m.get(indice0)!,    // Retrieve the bottom-left vertex index
                        m.get(indice2)!,    // Retrieve the bottom-right vertex index
                        m.get(indice3)!,    // Retrieve the top-right vertex index
                        m.get(indice0)!,    // Retrieve the bottom-left vertex index
                        m.get(indice3)!,    // Retrieve the top-right vertex index
                        m.get(indice1)!     // Retrieve the top-left vertex index
                    );
                } else {
                    this.indices.push(
                        m.get(indice0)!,    // Retrieve the bottom-left vertex index
                        m.get(indice1)!,    // Retrieve the top-left vertex index
                        m.get(indice2)!,    // Retrieve the bottom-right vertex index
                        m.get(indice1)!,    // Retrieve the top-left vertex index
                        m.get(indice2)!,    // Retrieve the bottom-right vertex index
                        m.get(indice3)!     // Retrieve the top-right vertex index
                    );
                }
            }
        }

        return true; // Return true indicating that the grid was regenerated
    }


    /**
     * Serializes the MeshData object.
     * @returns The serialized MeshData object.
     */
    serialize(): any {
        const data: any = {
            verts: this.vertices.map((v) => [v.x, v.y]),
            indices: this.indices,
            origin: this.origin!.toArray(),
        };

        if (this.uvs && this.uvs.length > 0) {
            data.uvs = this.uvs.map((uv) => [uv.x, uv.y]);
        }

        if (this.gridAxes && this.gridAxes.length === 2) {
            data.grid_axes = this.gridAxes;
        }

        return data;
    }
    
    static deserialize(data: any): MeshData {
        const meshData = new MeshData();
    
        if (data.verts && Array.isArray(data.verts)) {
            for (let i = 0; i < data.verts.length; i += 2) {
                const x = data.verts[i];
                const y = data.verts[i + 1];
                if (typeof x === 'number' && typeof y === 'number') {
                    meshData.vertices.push(new Vector2(x, y));
                } else {
                    console.error('Unexpected values for vert coordinates:', x, y);
                }
            }
        }
    
        if (data.uvs && Array.isArray(data.uvs)) {
            meshData.uvs = [];
            for (let i = 0; i < data.uvs.length; i += 2) {
                const x = data.uvs[i];
                const y = data.uvs[i + 1];
                if (typeof x === 'number' && typeof y === 'number') {
                    meshData.uvs.push(new Vector2(x, y));
                } else {
                    console.error('Unexpected values for uv coordinates:', x, y);
                }
            }
        }
    
        if (data.indices && Array.isArray(data.indices)) {
            meshData.indices = data.indices;
        }
    
        if (data.origin && Array.isArray(data.origin)) {
            meshData.origin!.fromArray(data.origin);
        }
    
        if (data.grid_axes && Array.isArray(data.grid_axes)) {
            meshData.gridAxes = data.grid_axes;
        }
    
        return meshData;
    }    
}

export { MeshData };
