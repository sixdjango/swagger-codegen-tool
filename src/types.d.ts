import { PropertiesType } from "./generatePython";

export interface CodegenComponents {
  class_name: string;
  
}

export interface SwaggerSchema {
  openapi:    string;
  info:       InfoClass;
  servers:    Server[];
  tags:       Tag[];
  paths:      Path;
  components: Components;
}

export interface InfoClass {
  title: string;
  description: string;
  termsOfService: string;
  rmsOfService: string;
  contact: {};
  license: License;
  version: string;
}

export interface Components {
  schemas: Schemas;
}

export type Schemas = Record<string, Info>

export interface Info {
  title:       string;
  type:        PropertiesType;
  properties?: Properties;
  description: string;
}

export type PropertiesValue = {description: string, type?: PropertiesType, $ref?: string, format?: Format, items: PropertiesValue}

export type Properties = Record<string, PropertiesValue>



export enum Format {
  DateTime = "date-time",
  Int64 = "int64",
}

export type Content = {
  "application/json": {
    "schema": PropertiesValue
  },
  "*/*": {
    "schema": PropertiesValue
  }
}

export type RequestContent ={
  content:Content
}

export type ResponseContent ={
  '200': {
    description: Description,
    content:Content
  }
}

export type MethodValue = {
  tags:        string[];
  summary:     string;
  description: string;
  operationId: string;
  parameters?:  Parameter[];
  requestBody?: RequestContent
  responses?:    ResponseContent;
}

export interface Parameter {
  name:        string;
  in:          string;
  description: string;
  required:    boolean;
  style:       string;
  schema:      PropertiesValue;
}

export interface ParameterSchema {
  type: string;
}


export type Method = Record<string,  MethodValue>




export interface License {
  name: string;
  url:  string;
}

export type  Path = Record<string, Method>

export enum Description {
  Created = "Created",
  Forbidden = "Forbidden",
  NoContent = "No Content",
  NotFound = "Not Found",
  Ok = "OK",
  Unauthorized = "Unauthorized",
}
export interface Server {
  url:         string;
  description: string;
}

export interface Tag {
  name:        string;
  description: string;
}
