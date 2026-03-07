import { IDomainEvent } from "./events/domain-event.interface";
import { Notification } from "./notification";
import { ValueObject } from "./value-objects/value-object";
import EventEmitter2 from "eventemitter2";

export abstract class Entity {
  notification = new Notification();
  localMediator = new EventEmitter2();

  dispatchedEvents: Set<IDomainEvent> = new Set<IDomainEvent>();
  events: Set<IDomainEvent> = new Set<IDomainEvent>();

  abstract get entity_id(): ValueObject;
  abstract toJSON(): object;

  applyEvent(event: IDomainEvent) {
    this.events.add(event);
    this.localMediator.emit(event.constructor.name, event);
  }

  registerHandler(event: string, handler: (event: IDomainEvent) => void) {
    this.localMediator.on(event, handler);
  }

  markEventAsDispatched(event: IDomainEvent) {
    this.dispatchedEvents.add(event);
  }

  getUncommittedEvents(): IDomainEvent[] {
    return Array.from(this.events).filter(
      (event) => !this.dispatchedEvents.has(event),
    );
  }

  clearEvents() {
    this.events.clear();
    this.dispatchedEvents.clear();
  }
}
