import * as mqtt from 'mqtt';
import * as stream from 'stream';
import { Logger } from '../util/logger';
import * as Chalk from 'chalk';
import { ConfigService } from '../core/config.service';

const DuplexStream = stream.Duplex;
export class Stream extends DuplexStream {
    private type: string;
    private host: string;
    private port: number;
    private username: string;
    private id: string;
    private key: string;
    private buffer: any[];
    private client: any;
    private connected: boolean;
    constructor(options: any) {

        const config = ConfigService.getConfig();
        super({
            readableObjectMode: false,
            writableObjectMode: false,
            highWaterMark: 102400
        });

        this.type = 'feeds';
        this.host = config.adafruit.host || 'io.adafruit.com';
        this.port = config.adafruit.port || 8883;
        this.buffer = [];
        this.client = false;

        Object.assign(this, options || {});

        if (this.type === 'data')
            this.type = 'feeds';

    }

    connect(id?: string) {
        Logger.debug(`Establish connection to server ${Chalk.default.blue(`${this.host}:${this.port}`)}`);

        this.id = id || this.id;

        this.client = mqtt.connect({
            host: this.host,
            port: this.port,
            protocol: (this.port === 8883 ? 'mqtts' : 'mqtt'),
            username: this.username,
            password: this.key,
            connectTimeout: 60 * 1000,
            keepalive: 3600
        });

        this.client.on('connect', () => {
            Logger.info(`Connected!`);

            this.client.subscribe(`${this.username}/${this.type}/${this.id}/json`);
            this.connected = true;
            this.emit('connected');
        });

        this.client.on('reconnect', () => {
            this.client.subscribe(`${this.username}/${this.type}/${this.id}/json`);
            this.connected = true;
            this.emit('connected');
        });

        this.client.on('error', (err) => this.emit('error', err));

        this.client.on('offline', () => this.connected = false);

        this.client.on('close', () => this.connected = false);

        this.client.on('message', (topic, message) => {
            Logger.silly(`Received message ` + message);
            this.buffer.push(message);
            this.emit('message', message);
        });

    }

    _read() {

        if (!this.connected)
            return this.once('connected', () => this._read());

        if (this.buffer.length === 0)
            return this.once('message', () => this._read());

        try {
            this.push(this.buffer.shift());
        } catch (err) {
            this.emit('error', err);
            this.once('message', () => this._read());
        }

    }

    _write(data, encoding, next) {

        if (!this.connected)
            return this.once('connected', () => this._write(data, encoding, next));

        this.client.publish(`${this.username}/${this.type}/${this.id}`, data.toString().trim());

        next();

    }

}
