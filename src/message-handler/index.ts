import { Stream } from './stream';

import { Observable } from 'rxjs';
import { ConfigService } from '../core/config.service';
import * as axios from 'axios';
import { Logger } from '../util/logger';
import { OutgoingMessage } from '../common/outgoing-message.interface';
import { DialogflowResponse } from '../common/dialogflow-response';


export class MessageHandler {
    private streamIn: Stream;
    private streamOutUrl: string;
    private key: string;
    constructor() {
        const config = ConfigService.getConfig();
        const { key, username, feedIdIn, feedIdOut } = config.adafruit;
        const type = 'feeds';
        this.key = key;
        this.streamIn = new Stream({ username, key, type, id: feedIdIn })
        this.streamOutUrl = `https://io.adafruit.com/api/v2/${username}/feeds/${feedIdOut}/data`;
    }

    connect() {
        this.streamIn.connect();
    }

    onMessage() {
        return Observable.create(observer => {
            this.streamIn.on('message', data => {
                const parsedData = JSON.parse(data.toString('utf8'));
                observer.next(parsedData.last_value);
            });
        });
    }

    async sendMessage(value: OutgoingMessage<DialogflowResponse>) {
        const headers = { 'X-AIO-Key': this.key };
        Logger.debug(`Sending POST to url ${this.streamOutUrl} with headers ${JSON.stringify(headers)} and data ${JSON.stringify({ value })}`)
        await axios.default.post(this.streamOutUrl, { value: JSON.stringify(value) }, { headers })
    }
}
