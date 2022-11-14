/**
 * Copyright (c) 2022 Inochi2D Project. All rights reserved.
 * Distributed under the 2-Clause BSD License, see LICENSE file.
 */

/** An enum for the allowed types of modification */
export enum PuppetAllowedModification {
  /** Modification is prohibited */
  Prohibited = 'prohibited',

  /** Modification is only allowed for personal use */
  AllowPersonal = 'allowPersonal',

  /**
   * Modification is allowed with redistribution, see
   * `allowedRedistribution` for redistribution terms
   */
  AllowRedistribute = 'allowRedistribute'
}

/** An enum for the allowed types of redistribution */
export enum PuppetAllowedRedistribution {
  /** Redistribution is prohibited */
  Prohibited = 'prohibited',

  /**
   * Redistribution is allowed, but only under the same
   * license as the original
   */
  ViralLicense = 'viralLicense',

  /**
   * Redistribution is allowed, and the puppet may be
   * redistributed under a different license than the
   * original.
   *
   * This goes in conjunction with modification rights.
   */
  CopyleftLicense = 'copyleftLicense'
}

/** An enum for the allowed users of the puppet */
export enum PuppetAllowedUsers {
  /** Only the author(s) are allowed to use the puppet */
  OnlyAuthor = 'onlyAuthor',

  /** Only licensee(s) are allowed to use the puppet */
  OnlyLicensee = 'onlyLicensee',

  /** Everyone may use the model */
  Everyone = 'everyone'
}

/** Magic value meaning that the model has no thumbnail */
export const NO_THUMBNAIL = 4294967295

export class Puppet {}

export class PuppetMeta {
  /** Artist(s) of the puppet */
  public artist = ''

  /** Contact informatin of the first author */
  public contact = ''

  /** Copyright string */
  public copyright = ''

  /** URL of license */
  public licenseUrl = ''

  /** Name of the puppet */
  public name = ''

  /**
   * Whether the puppet should preserve pixel borders. This
   * feature is mainly useful for puppets which use pixel art.
   */
  public preservePixels = false

  /** Link to the origin of this puppet */
  public reference = ''

  /** Rigger(s) of the puppet */
  public rigger = ''

  /** Usage rights of the puppet */
  public rights: PuppetUsageRights = new PuppetUsageRights()

  /** Texture ID of this puppet's thumbnail */
  public thumbnailId: number = NO_THUMBNAIL

  /**
   * The version of the Inochi2D spec that was used when
   * creating this model
   */
  public version = '1.0-alpha'
}

export class PuppetUsageRights {
  /** Whether commercial use is allowed */
  public allowCommercial = false

  /** Who is allowed to use the puppet? */
  public allowedUsers: PuppetAllowedUsers = PuppetAllowedUsers.OnlyAuthor

  /** Whether a model may be modified */
  public allowModification: PuppetAllowedModification = PuppetAllowedModification.Prohibited

  /** Whether a model may be redistributed */
  public allowRedistribution: PuppetAllowedRedistribution = PuppetAllowedRedistribution.Prohibited

  /** Whether sexual content is allowed */
  public allowSexual = false

  /** Whether violent content is allowed */
  public allowViolence = false

  /** Whether the author(s) must be attributed for use */
  public requireAttribution = false
}
