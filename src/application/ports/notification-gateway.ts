import { NotificationPayload } from "../../domain/schemas/notification.schema";

export interface INotificationGateway {
    send(notification: NotificationPayload): Promise<void>;
}