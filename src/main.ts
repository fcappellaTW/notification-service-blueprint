import { IDateTimeProvider } from "./application/ports/date-time-provider";
import { SendNotificationUseCase } from "./application/use-cases/send-notification.use-case";
import { ConsoleNotificationGateway } from "./infrastructure/gateways/console-notification.gateway";

class RealDateTimeProvider implements IDateTimeProvider {
    now(): Date {
        return new Date(1710000000000);
    }
}

async function main() {
    const dateTimeProvider = new RealDateTimeProvider();
    const notificationGateway = new ConsoleNotificationGateway();
    const sendNotificationUseCase = new SendNotificationUseCase(dateTimeProvider, notificationGateway);

    console.log('Attempting to send a notification...');

    try {
        await sendNotificationUseCase.execute({
            recipientEmail: 'john.doe@email.com',
            subject: 'Welcome!',
            body: 'Hello John, welcome to our platform.',
        });
        console.log('Notification sent successfully.');
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

main();