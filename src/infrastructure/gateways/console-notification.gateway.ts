import { INotificationGateway } from "../../application/ports/notification-gateway";
import { SendNotificationPayload } from "../../application/use-cases/send-notification.use-case";

export class ConsoleNotificationGateway implements INotificationGateway {
    async send(notification: SendNotificationPayload): Promise<void> {
        console.log('--- New Notification to Send ---');
        console.log(`Recipient: ${notification.recipientEmail}`);
        console.log(`Subject: ${notification.subject}`);
        console.log(`Body: ${notification.body}`);
        console.log('--------------------------------');
        return Promise.resolve();
    }
}