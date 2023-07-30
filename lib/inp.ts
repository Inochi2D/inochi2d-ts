/*
    Copyright © 2020, Inochi2D Project
    Distributed under the 2-Clause BSD License, see LICENSE file.
    
    Authors: Luna Nielsen
*/
import { Puppet, deserializePuppet } from "./puppet";
import * as THREE from 'three';
import { Parser } from "binary-parser";
import { decode } from "fast-png";
import { decodeTga } from "@lunapaint/tga-codec";


export async function downloadFile(url: string): Promise<Uint8Array> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer)
    return uint8Array;
}

export async function inImport(filebuffer: Uint8Array): Promise<Puppet> {

    const textureparser = new Parser()
        .uint32("payloadLength")
        .uint8("type")
        .array("data", { type: "uint8", length: "payloadLength" });

    // Create parser
    const inpparser = new Parser()
        .string("magic", { length: 8, assert: "TRNSRTS\0"})
        .uint32("payloadLength")
        .string("payload", { length: "payloadLength" })
        .string("magic", { length: 8, assert: "TEX_SECT"})
        .uint32("textureCount")
        .array("textures", {type: textureparser, length: "textureCount" });

    // Parse INP file
    let parsed = inpparser.parse(filebuffer);
    let textureLoads: Promise<THREE.DataTexture>[] = new Array<Promise<THREE.DataTexture>>(0);
    parsed.textures.forEach((texture: any) => {
        let t: number = texture.type;
        let data: Uint8Array = new Uint8Array(texture.data);
        switch(t) {
            case 0:
                textureLoads.push(
                    new Promise((complete, _) => {
                        // Load PNG file from memory stream
                        let png = decode(data)
                        let texture = new THREE.DataTexture(png.data, png.width, png.height);
                        texture.generateMipmaps = true;
                        texture.needsUpdate = true;
                        complete(texture);
                    })
                );
                break;
            case 1:
                // Load TGA file from memory stream
                textureLoads.push(
                    new Promise(async (complete, failure) => {
                        decodeTga(data, { detectAmbiguousAlphaChannel: true }).then(tga => {
                            let texture = new THREE.DataTexture(tga.image.data, tga.image.width, tga.image.height);
                            texture.generateMipmaps = true;
                            texture.needsUpdate = true;
                            complete(texture);
                        }).catch((reason) => {
                            failure(reason);
                        });
                    })
                );
                break;
            default:
                throw "Could not decode texture data";
        }
    });

    return (async () => {
        // Wait for textures and parse puppet
        let textures = await Promise.all(textureLoads);
        let puppet: Puppet = deserializePuppet(JSON.parse(parsed.payload), textures);

        // console.log(parsed.payload)

        // Apply textures
        puppet.textures = Array.from(textures) as any;

        // Return puppet
        return puppet;
    })();
}

export async function inImportFromURL(url: string): Promise<Puppet> {
    return await inImport(await (downloadFile(url)));
}