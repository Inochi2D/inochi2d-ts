/*
	Copyright © 2020, Inochi2D Project
	Distributed under the 2-Clause BSD License, see LICENSE file.
    
	Authors: Luna Nielsen
*/

import { Texture } from 'three';
import { Node } from './nodes/node';
import { deserializeNode as deserializeNode } from "./nodes/serialiser";

export const NO_THUMBNAIL = 4294967295;

export enum PuppetAllowedUsers {
	OnlyAuthor = "onlyAuthor",
	OnlyLicensee = "onlyLicensee",
	Everyone = "everyone"
}

export enum PuppetAllowedRedistribution {
	Prohibited = "prohibited",
	ViralLicense = "viralLicense",
	CopyleftLicense = "copyleftLicense"
}

export enum PuppetAllowedModification {
	Prohibited = "prohibited",
	AllowPersonal = "allowPersonal",
	AllowRedistribute = "allowRedistribute",
}

export class PuppetUsageRights {
	allowedUsers: PuppetAllowedUsers = PuppetAllowedUsers.OnlyAuthor;
	allowViolence: boolean = false;
	allowSexual: boolean = false;
	allowCommercial: boolean = false;
	allowRedistribution: PuppetAllowedRedistribution = PuppetAllowedRedistribution.Prohibited;
	allowModification: PuppetAllowedModification = PuppetAllowedModification.Prohibited;
	requireAttribution: boolean = false;
}

export class PuppetMeta {
	name: string = "";
	version: string = "1.0-alpha";
	rigger: string = "";
	artist: string = "";
	rights: PuppetUsageRights = new PuppetUsageRights();
	copyright: string = "";
	licenseURL: string = "";
	contact: string = "";
	reference: string = "";
	thumbnailId: number = NO_THUMBNAIL;
	preservePixels: boolean = false;
}

export class Puppet {
	meta: PuppetMeta = new PuppetMeta();
	textures: Texture[] = [];
	rootNode: Node = new Node();

	// Non-serialisable
	nodes: Node[] = [];
}

export function deserializePuppet(json: any, textures: Texture[]): Puppet {
	const puppet = new Puppet();
	puppet.meta = json.meta;
	puppet.textures = textures;
	puppet.rootNode = deserializeNode(puppet, json.nodes);
	puppet.rootNode.transform.scale.y *= -1; // Weird rotation moment!
	puppet.rootNode.update();
	return puppet;
}
