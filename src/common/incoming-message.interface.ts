export interface IncomingMessage<T> {
    requestId: string;
    data: PayloadData<T>;
}

export interface PayloadData<T> {
    queryText: string;
    parameters: T;
    allRequiredParamsPresent: boolean;
    fulfillmentMessages: FulfillmentMessage[];
    intent: Intent;
    intentDetectionConfidence: number;
    languageCode: string;
}

export interface FulfillmentMessage {
    text: Text;
}

export interface Text {
    text: string[];
}

export interface Intent {
    name: string;
    displayName: string;
}
