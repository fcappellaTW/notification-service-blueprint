import { NotificationPayload } from "../../domain/schemas/notification.schema";
import { ConsoleNotificationGateway } from "./console-notification.gateway";

describe('ConsoleNotificationGateway Integration Test', () => {
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
    });

    it('should log the notification details to the console', async () => {
        const gateway = new ConsoleNotificationGateway();
        const payload: NotificationPayload = {
            recipientEmail: 'test@example.com',
            subject: 'My Subject',
            body: 'My message body',
        };

        await gateway.send(payload);

        expect(consoleLogSpy).toHaveBeenCalledWith('--- New Notification to Send ---');
        expect(consoleLogSpy).toHaveBeenCalledWith(`Recipient: ${payload.recipientEmail}`);
        expect(consoleLogSpy).toHaveBeenCalledWith(`Subject: ${payload.subject}`);
        expect(consoleLogSpy).toHaveBeenCalledWith(`Body: ${payload.body}`);
        expect(consoleLogSpy).toHaveBeenCalledWith('--------------------------------');
    });
});