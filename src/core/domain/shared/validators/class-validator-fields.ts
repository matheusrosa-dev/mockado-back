import { validateSync } from "class-validator";
import { IValidatorFields } from "./class-validator-fields.interface";
import { Notification } from "../notification";

export abstract class ClassValidatorFields implements IValidatorFields {
  // biome-ignore lint/suspicious/noExplicitAny: <The method needs to accept any type of data for validation>
  validate(notification: Notification, data: any, fields?: string[]): boolean {
    const errors = validateSync(data, {
      groups: fields as string[] | undefined,
    });

    if (errors.length) {
      for (const error of errors) {
        Object.values(error.constraints!).forEach((message) => {
          const field = error.property.replace(/^_/, ""); // Removes leading underscore if present
          const formattedMessage = message.replace(/_/, ""); // Removes underscore from the message if present

          notification.addError(formattedMessage, field);
        });
      }
    }
    return !errors.length;
  }
}
