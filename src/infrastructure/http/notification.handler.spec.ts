import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { SendNotificationPayload, SendNotificationUseCase } from "../../application/use-cases/send-notification.use-case";
import { handler } from "./notification.handler";

describe('Notification Lambda Handler ', () => {
    let sendNotificationUseCaseMock: jest.Mocked<SendNotificationUseCase>;

    beforeEach(() => {
        sendNotificationUseCaseMock = {
          execute: jest.fn(),
        } as any;
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

        const result = await handler(
            event as APIGatewayProxyEvent,
            {} as Context,
            sendNotificationUseCaseMock,
        )

        expect(result.statusCode).toBe(202);
        expect(sendNotificationUseCaseMock.execute).toHaveBeenCalledTimes(1);
        expect(sendNotificationUseCaseMock.execute).toHaveBeenCalledWith(validPayload);
    });
});