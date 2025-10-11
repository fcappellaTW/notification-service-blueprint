import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { SendNotificationUseCase } from "../../application/use-cases/send-notification.use-case";
import { handlerLogic } from "./notification.handler";
import { InvalidTimeException } from "../../domain/errors/invalid-time.exception";
import { NotificationPayload } from "../../domain/schemas/notification.schema";

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
        const validPayload: NotificationPayload = {
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
        const validPayload = {
            recipientEmail: 'fail@example.com',
            subject: 'Subject',
            body: 'Body',
          };
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

    it('should return 400 when the request body is missing a required field (e.g., subject)', async () => {
        const invalidPayload = {
            recipientEmail: 'test@example.com',
            body: 'This is a body without a subject.',
        };

        const event: Partial<APIGatewayProxyEvent> = {
            body: JSON.stringify(invalidPayload),
        };

        const result = await handlerLogic(
            event as APIGatewayProxyEvent,
            {} as Context,
            sendNotificationUseCaseMock
        );

        expect(result.statusCode).toBe(400);

        const resultBody = JSON.parse(result.body);
        expect(resultBody.message).toContain('Bad Request');
        expect(sendNotificationUseCaseMock.execute).not.toHaveBeenCalled();
    });
});