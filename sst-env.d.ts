/* This file is auto-generated by SST. Do not edit. */
/* tslint:disable */
/* eslint-disable */
/* deno-fmt-ignore-file */
import "sst"
export {}
declare module "sst" {
  export interface Resource {
    "MyApi": {
      "name": string
      "type": "sst.aws.Function"
      "url": string
    }
    "MyEmail": {
      "configSet": string
      "sender": string
      "type": "sst.aws.Email"
    }
    "PrimoAI": {
      "type": "sst.aws.Remix"
      "url": string
    }
  }
}