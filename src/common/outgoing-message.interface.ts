export interface OutgoingMessage<T> {
    requestId: string;
    data: T;
}
