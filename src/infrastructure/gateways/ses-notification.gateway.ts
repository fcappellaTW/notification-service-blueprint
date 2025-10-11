// src/infrastructure/gateways/ses-notification.gateway.ts
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { INotificationGateway } from '../../application/ports/notification-gateway';
import { NotificationPayload } from '../../domain/schemas/notification.schema';

export class SESNotificationGateway implements INotificationGateway {
  private readonly _sesClient: SESClient;

  constructor() {
    this._sesClient = new SESClient({});
  }

  async send(notification: NotificationPayload): Promise<void> {
    const sourceEmail = process.env.SOURCE_EMAIL;
    if (!sourceEmail) {
      throw new Error('SOURCE_EMAIL environment variable is not set.');
    }

    const command = new SendEmailCommand({
      Source: sourceEmail,
      Destination: {
        ToAddresses: [notification.recipientEmail],
      },
      Message: {
        Subject: { Data: notification.subject },
        Body: {
          Text: { Data: notification.body },
        },
      },
    });

    try {
      await this._sesClient.send(command);
      console.log(`Email successfully sent to ${notification.recipientEmail}`);
    } catch (error) {
      console.error('Failed to send email via SES:', error);
      throw new Error('Failed to send email.');
    }
  }
}