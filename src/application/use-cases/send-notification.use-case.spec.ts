import { IDateTimeProvider } from "../ports/date-time-provider";
import { SendNotificationPayload, SendNotificationUseCase } from "./send-notification.use-case";
import { InvalidTimeException } from "../../domain/errors/invalid-time.exception";
import { INotificationGateway } from "../ports/notification-gateway";

describe('SendNotification Use Case', () => {
    let sut: SendNotificationUseCase;
    let dateTimeProviderStub: IDateTimeProvider;
    let notificationGatewayMock: INotificationGateway;

    beforeEach(() => {
      dateTimeProviderStub = { now: () => new Date() };
      notificationGatewayMock = { send: jest.fn() };

      sut = new SendNotificationUseCase(
        dateTimeProviderStub,
        notificationGatewayMock
      );
    });

    it('should throw an invalid time error when trying to send a notification outside the allowed window', async () => {
      jest.spyOn(dateTimeProviderStub, 'now').mockReturnValue(new Date(2025, 9, 10, 23, 0, 0));

      const invalidNotificationPayload: SendNotificationPayload = {
        recipientEmail: 'test@example.com',
        subject: 'My Subject',
        body: 'My message body',
      };

      await expect(sut.execute(invalidNotificationPayload)).rejects.toThrow(
        InvalidTimeException
      );
      expect(notificationGatewayMock.send).not.toHaveBeenCalled();
    });

    it('should call the notification gateway when the notification is sent within the allowed window', async () => {
        jest.spyOn(dateTimeProviderStub, 'now').mockReturnValue(new Date(2025, 9, 10, 10, 0, 0)); // October 10, 10:00

        const payload: SendNotificationPayload = {
            recipientEmail: 'test@example.com',
            subject: 'My Subject',
            body: 'My message body',
        };

        await sut.execute(payload);

        expect(notificationGatewayMock.send).toHaveBeenCalledTimes(1);
        expect(notificationGatewayMock.send).toHaveBeenCalledWith(payload);
    });
  });