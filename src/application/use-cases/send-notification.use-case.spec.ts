import { IDateTimeProvider } from "../ports/date-time-provider";
import { SendNotificationPayload, SendNotificationUseCase } from "./send-notification.use-case";
import { InvalidTimeException } from "../../domain/errors/invalid-time.exception";

describe('SendNotification Use Case', () => {
    it('should throw an invalid time error when trying to send a notification outside the allowed window', () => {
      class DateTimeProviderStub implements IDateTimeProvider {
        now(): Date {
          const today = new Date();
          today.setHours(23, 0, 0, 0);
          return today;
        }
      }

      const fakeDateTimeProvider = new DateTimeProviderStub();

      const sut = new SendNotificationUseCase(fakeDateTimeProvider);
      const invalidNotificationPayload: SendNotificationPayload = {
        recipientEmail: 'test@example.com',
        subject: 'My Subject',
        body: 'My message body',
      };

      expect(() => sut.execute(invalidNotificationPayload)).toThrow(
        InvalidTimeException
      );
    });
  });