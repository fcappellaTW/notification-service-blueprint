import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { SendNotificationPayload, SendNotificationUseCase } from "../../application/use-cases/send-notification.use-case";

export const handler = async (
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
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' })
        }
    }
};