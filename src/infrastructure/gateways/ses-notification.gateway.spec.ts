// src/infrastructure/gateways/ses-notification.gateway.spec.ts
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { mockClient } from 'aws-sdk-client-mock';
import { SESNotificationGateway } from './ses-notification.gateway';
import { NotificationPayload } from '../../domain/schemas/notification.schema';

const sesMock = mockClient(SESClient);

describe('SESNotificationGateway Integration Test', () => {
  beforeEach(() => {
    sesMock.reset();
  });

  it('should call the SendEmailCommand with the correct parameters', async () => {
    process.env.SOURCE_EMAIL = 'noreply@test.com';

    const gateway = new SESNotificationGateway();
    const payload: NotificationPayload = {
      recipientEmail: 'test@example.com',
      subject: 'My Subject',
      body: 'My message body',
    };

    sesMock.on(SendEmailCommand).resolves({});

    await gateway.send(payload);

    const commandCalls = sesMock.commandCalls(SendEmailCommand);

    expect(commandCalls).toHaveLength(1);

    const commandInput = commandCalls[0].args[0].input;

    expect(commandInput.Source).toBe(process.env.SOURCE_EMAIL);
    expect(commandInput.Destination?.ToAddresses).toEqual([payload.recipientEmail]);
    expect(commandInput.Message?.Subject?.Data).toBe(payload.subject);
    expect(commandInput.Message?.Body?.Text?.Data).toBe(payload.body);
  });
});