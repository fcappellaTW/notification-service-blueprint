import { InvalidTimeException } from "../../domain/errors/invalid-time.exception";
import { IDateTimeProvider } from "../ports/date-time-provider";
import { INotificationGateway } from "../ports/notification-gateway";

export type SendNotificationPayload = {
    recipientEmail: string;
    subject: string;
    body: string;
};

const FORBIDDEN_WINDOW_START_HOUR = 6;
const FORBIDDEN_WINDOW_END_HOUR = 22;

export class SendNotificationUseCase {
    constructor(private readonly _dateTimeProvider: IDateTimeProvider, private readonly _notificationGateway: INotificationGateway) {}

    async execute(payload: SendNotificationPayload): Promise<void> {
        const now = this._dateTimeProvider.now();
        const currentHour = now.getHours();

        if (currentHour >= FORBIDDEN_WINDOW_END_HOUR || currentHour < FORBIDDEN_WINDOW_START_HOUR) {
            throw new InvalidTimeException('Notification can only be sent between 6am and 10pm');
        };

        await this._notificationGateway.send(payload);
    }
}