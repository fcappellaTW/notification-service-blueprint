import { INotificationGateway } from "../../application/ports/notification-gateway";
import { NotificationPayload } from "../../domain/schemas/notification.schema";

export class ConsoleNotificationGateway implements INotificationGateway {
    async send(notification: NotificationPayload): Promise<void> {
        console.log('--- New Notification to Send ---');
        console.log(`Recipient: ${notification.recipientEmail}`);
        console.log(`Subject: ${notification.subject}`);
        console.log(`Body: ${notification.body}`);
        console.log('--------------------------------');
        return Promise.resolve();
    }
}