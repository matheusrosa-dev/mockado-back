import { Notification } from "../notification";

export type FieldsErrors =
  | {
      [field: string]: string[];
    }
  | string;

export interface IValidatorFields {
  // biome-ignore lint/suspicious/noExplicitAny: <The method needs to accept any type of data for validation>
  validate(notification: Notification, data: any, fields?: string[]): boolean;
}
