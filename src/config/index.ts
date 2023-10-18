import { Document, Expression, FilterQuery, PipelineStage, Types } from 'mongoose'

declare module 'express' {
  export interface Request {
    tenant: string
    user: JWTPayload
    isAuthorization: boolean
    jwt: string
  }
}

const envConfig = {
  JWT_SECRET: process.env.JWT_SECRET || '',
  HOST_URL: process.env.HOST_URL || '',
  PUBLIC_KEY: process.env.PUBLIC_KEY || '',
  MONGODB_NAME: process.env.MONGODB_NAME || '',
}

declare global {
  var GlobalConfig: {
    [k in keyof typeof envConfig]: string
  }
  export interface JWTPayload {
    _id: Types.ObjectId
    tenant: string
  }
  interface NestedObjectSelect {
    [k: string]: number | NestedObjectSelect
  }
  interface QueryParams {
    skip: number
    limit: number
    sort?: Record<string, 1 | -1 | Expression.Meta>
  }
  type StringOrObjectId = string | Types.ObjectId
  type MergePopulate<I, IP> = Omit<
    Document<
      unknown,
      {},
      I & {
        _id: Types.ObjectId
      }
    > &
    Omit<
      I & {
        _id: Types.ObjectId
      } & Required<{
        _id: Types.ObjectId
      }>,
      never
    >,
    keyof IP
  > &
    IP

  type RecursiveKeyOf<TObj> = {
    [TKey in keyof TObj & (string | number)]: TObj[TKey] extends
    | any[]
    | Types.ObjectId
    ? `${TKey}`
    : TObj[TKey] extends Types.ObjectId | string
    ? `${TKey}` | `${TKey}.${RecursiveKeyOf<TObj[TKey]>}`
    : `${TKey}`
  }[keyof TObj & (string | number)]


  type GeneratePipeline<T = any> = {
    from: string
    localField: RecursiveKeyOf<T> | RecursiveKeyOf<T>[]
    foreignField?: string
    as?: string
    lookup?: GeneratePipeline[]
    unwind?: boolean
    pipeline?: Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[]
    postPipeline?: Exclude<
      PipelineStage,
      PipelineStage.Merge | PipelineStage.Out
    >[]
    match?: FilterQuery<any>,
    project?: NestedObjectSelect,
    keepNull?: boolean
    global?: boolean
    let?: PipelineStage.Lookup['$lookup']['let'],
    sort?: Record<string, 1 | -1 | Expression.Meta>,
    skip?: number,
    limit?: number
  }

  type GeneratePipelineWithOptions<T = any> = (query?: FilterQuery<any>, select?: NestedObjectSelect) => GeneratePipeline<T>
  interface Pagination {
    page: null | number
    limit: null | number
  }
}
global.GlobalConfig = envConfig
