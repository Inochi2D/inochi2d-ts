/*
    Copyright © 2020, Inochi2D Project
    Distributed under the 2-Clause BSD License, see LICENSE file.
    
    Authors: Luna Nielsen
*/
import { Texture } from 'three';
import { Node } from './nodes/node';

/**
    Magic value meaning that the model has no thumbnail
*/
export const NO_THUMBNAIL = 4294967295;

export enum PuppetAllowedUsers {
    /**
        Only the author(s) are allowed to use the puppet
    */
    OnlyAuthor = "onlyAuthor",

    /**
        Only licensee(s) are allowed to use the puppet
    */
    OnlyLicensee = "onlyLicensee",

    /**
        Everyone may use the model
    */
    Everyone = "everyone"
}

export enum PuppetAllowedRedistribution {
    /**
        Redistribution is prohibited
    */
    Prohibited = "prohibited",

    /**
        Redistribution is allowed, but only under
        the same license as the original.
    */
    ViralLicense = "viralLicense",

    /**
        Redistribution is allowed, and the puppet
        may be redistributed under a different
        license than the original.

        This goes in conjunction with modification rights.
    */
    CopyleftLicense = "copyleftLicense"
}

export enum PuppetAllowedModification {
    /**
        Modification is prohibited
    */
    Prohibited = "prohibited",

    /**
        Modification is only allowed for personal use
    */
    AllowPersonal = "allowPersonal",

    /**
        Modification is allowed with redistribution,
        see allowedRedistribution for redistribution terms.
    */
    AllowRedistribute = "allowRedistribute",
}

export class PuppetUsageRights {
    /**
        Who is allowed to use the puppet?
    */
    allowedUsers: PuppetAllowedUsers = PuppetAllowedUsers.OnlyAuthor;

    /**
        Whether violence content is allowed
    */
    allowViolence: boolean = false;

    /**
        Whether sexual content is allowed
    */
    allowSexual: boolean = false;

    /**
        Whether commerical use is allowed
    */
    allowCommercial: boolean = false;

    /**
        Whether a model may be redistributed
    */
    allowRedistribution: PuppetAllowedRedistribution = PuppetAllowedRedistribution.Prohibited;

    /**
        Whether a model may be modified
    */
    allowModification: PuppetAllowedModification = PuppetAllowedModification.Prohibited;

    /**
        Whether the author(s) must be attributed for use.
    */
    requireAttribution: boolean = false;
}

export class PuppetMeta {

    /**
        Name of the puppet
    */
    name: string = "";
    /**
        Version of the Inochi2D spec that was used for creating this model
    */
    version: string = "1.0-alpha";

    /**
        Rigger(s) of the puppet
    */
    rigger: string = "";

    /**
        Artist(s) of the puppet
    */
    artist: string = "";

    /**
        Usage Rights of the puppet
    */
    rights: PuppetUsageRights = new PuppetUsageRights();

    /**
        Copyright string
    */
    copyright: string = "";

    /**
        URL of license
    */
    licenseURL: string = "";

    /**
        Contact information of the first author
    */
    contact: string = "";

    /**
        Link to the origin of this puppet
    */
    reference: string = "";

    /**
        Texture ID of this puppet's thumbnail
    */
    thumbnailId: number = NO_THUMBNAIL;

    /**
        Whether the puppet should preserve pixel borders.
        This feature is mainly useful for puppets which use pixel art.
    */
    preservePixels: boolean = false;
}

export class Puppet {
    meta: PuppetMeta = new PuppetMeta();
    textures: Array<Texture> = Array<Texture>(0);
    nodes: Node = new Node();
}