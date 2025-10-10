import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { SendNotificationPayload, SendNotificationUseCase } from "../../application/use-cases/send-notification.use-case";
import { handler, handlerLogic } from "./notification.handler";
import { InvalidTimeException } from "../../domain/errors/invalid-time.exception";

describe('Notification Lambda Handler ', () => {
    let sendNotificationUseCaseMock: jest.Mocked<SendNotificationUseCase>;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        sendNotificationUseCaseMock = {
          execute: jest.fn(),
        } as any;

        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('should call the use case and return 202 on valid request', async () => {
        const validPayload: SendNotificationPayload = {
            recipientEmail: 'success@example.com',
            subject: 'Valid Subject',
            body: 'Valid body.',
          };

        const event: Partial<APIGatewayProxyEvent> = {
           body: JSON.stringify(validPayload),
        };

        const result = await handlerLogic(
            event as APIGatewayProxyEvent,
            {} as Context,
            sendNotificationUseCaseMock,
        )

        expect(result.statusCode).toBe(202);
        expect(sendNotificationUseCaseMock.execute).toHaveBeenCalledTimes(1);
        expect(sendNotificationUseCaseMock.execute).toHaveBeenCalledWith(validPayload);
    });

    it('should return 400 on invalid request', async () => {
        const event: Partial<APIGatewayProxyEvent> = {
            body: null,
        };

        const result = await handlerLogic(
            event as APIGatewayProxyEvent,
            {} as Context,
            sendNotificationUseCaseMock
        );

        expect(result.statusCode).toBe(400);
        expect(sendNotificationUseCaseMock.execute).not.toHaveBeenCalled();
    });

    it('should return 422 on invalid time exception', async () => {
        const validPayload = {
            recipientEmail: 'fail@example.com',
            subject: 'Subject',
            body: 'Body',
          };

        const event: Partial<APIGatewayProxyEvent> = {
            body: JSON.stringify(validPayload),
        };

        sendNotificationUseCaseMock.execute.mockRejectedValue(
            new InvalidTimeException('Notifications cannot be sent...')
        );

        const result = await handlerLogic(
            event as APIGatewayProxyEvent,
            {} as Context,
            sendNotificationUseCaseMock
        );

        expect(result.statusCode).toBe(422);
        expect(result.body).toContain('Notifications cannot be sent');
    });

    it('should return 500 for unexpected errors', async () => {
        const validPayload = { /* ... */ };
        const event: Partial<APIGatewayProxyEvent> = { body: JSON.stringify(validPayload) };
        sendNotificationUseCaseMock.execute.mockRejectedValue(new Error('Unexpected DB error'));

        const result = await handlerLogic(
            event as APIGatewayProxyEvent,
            {} as Context,
            sendNotificationUseCaseMock
        );

        expect(result.statusCode).toBe(500);
        expect(result.body).toContain('Internal Server Error');
      });
});