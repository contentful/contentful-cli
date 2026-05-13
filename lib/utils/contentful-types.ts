export type LocalizedField<T> = Record<string, T>

export interface EntitySys {
  id: string
  version: number
  publishedVersion?: number
  archivedVersion?: number
  updatedAt?: string
  contentType?: {
    sys?: {
      id?: string
    }
  }
}

export interface AssetFileField {
  fileName?: string
  url?: string
  contentType?: string
}

export interface AssetLike {
  sys: EntitySys
  fields?: {
    title?: LocalizedField<string>
    file?: LocalizedField<AssetFileField>
  }
}

export interface EntryLike {
  sys: EntitySys
  fields?: Record<string, unknown>
}

export type QueryParams = Record<string, string | number | boolean | undefined>
