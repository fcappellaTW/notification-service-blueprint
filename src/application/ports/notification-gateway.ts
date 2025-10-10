import { SendNotificationPayload } from "../use-cases/send-notification.use-case";

export interface INotificationGateway {
    send(notification: SendNotificationPayload): Promise<void>;
}