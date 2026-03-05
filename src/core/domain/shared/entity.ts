import { Notification } from "./notification";
import { ValueObject } from "./value-object";

export abstract class Entity {
  notification = new Notification();

  abstract get entity_id(): ValueObject;

  abstract toJSON(): object;
}
