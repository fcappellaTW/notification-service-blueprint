import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { SendNotificationPayload, SendNotificationUseCase } from "../../application/use-cases/send-notification.use-case";
import { IDateTimeProvider } from "../../application/ports/date-time-provider";
import { ConsoleNotificationGateway } from "../gateways/console-notification.gateway";

class RealDateTimeProvider implements IDateTimeProvider {
    now(): Date {
      return new Date();
    }
  }

const dateTimeProvider = new RealDateTimeProvider();
const notificationGateway = new ConsoleNotificationGateway();
const sendNotificationUseCase = new SendNotificationUseCase(
  dateTimeProvider,
  notificationGateway
);

export const handlerLogic = async (
    event: APIGatewayProxyEvent,
    context: Context,
    useCase: SendNotificationUseCase
): Promise<APIGatewayProxyResult> => {
    try {
        if (!event.body) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Bad Request: Missing body' })}
        }

        const payload = JSON.parse(event.body) as SendNotificationPayload;

        await useCase.execute(payload);
        return {
            statusCode: 202,
            body: JSON.stringify({ message: 'Notification sent successfully' })
        }
    } catch (error: any) {

        console.error('An error occurred:', error);

        if (error.name === 'InvalidTimeException') {
            return { statusCode: 422, body: JSON.stringify({ message: error.message })};
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' })
        }
    }
};

export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context
  ): Promise<APIGatewayProxyResult> => {
    return handlerLogic(event, context, sendNotificationUseCase);
  };