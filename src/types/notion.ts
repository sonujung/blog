import { 
  PageObjectResponse, 
  PartialPageObjectResponse,
  DatabaseObjectResponse 
} from "@notionhq/client/build/src/api-endpoints";

export type NotionPage = PageObjectResponse | PartialPageObjectResponse;
export type NotionDatabase = DatabaseObjectResponse;

export interface NotionProperty {
  id: string;
  type: string;
  [key: string]: any;
}

export interface NotionBlock {
  id: string;
  type: string;
  [key: string]: any;
}