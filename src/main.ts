import { MessageHandler } from './message-handler';
import { Logger } from './util/logger';
import { PluginRegister, PluginContext } from './core/plugin-register';
import { IncomingMessage } from './common/incoming-message.interface';
import { AppSettings } from './common/app-settings.interface';
import { ConfigService } from './core/config.service';
import { map } from 'p-iteration';
import { TranslationHandler } from './translation-handler';
import { TranslationFunction } from 'i18next';
import { DialogflowResponse } from './common/dialogflow-response';

const DRY_RUN = process.env.DRY_RUN === 'true';

export class GoogleHomeOpenstack {
    private messageHandler: MessageHandler;
    private plugins: PluginContext[];
    private translationHandler: TranslationHandler;
    private t?: TranslationFunction;
    constructor(config: AppSettings) {
        ConfigService.setConfig(config);
        this.messageHandler = new MessageHandler();
        this.translationHandler = new TranslationHandler();
        this.plugins = PluginRegister.getPlugins();
    }

    private async onInitPlugins() {
        const promise = this.plugins.map(plugin => {
            Logger.debug('Initializing ' + plugin.name);
            if (plugin.instance.onInit) {
                return plugin.instance.onInit();
            }
            return Promise.resolve();
        });
        await Promise.all(promise);
    }

    private isMessageCompatibleWithPlugin(plugin: PluginContext, data: IncomingMessage<any>) {
        const incomingParameters = Object.keys(data.data.parameters);
        const requiredParameters = plugin.settings.requiredParameters;
        if (!requiredParameters) {
            return true;
        }
        let isCompatible = true;
        requiredParameters.forEach(param => {
            if (incomingParameters.indexOf(param) === -1) isCompatible = false;
        });
        return isCompatible;
    }

    private async executeOnMessageOfPlugin(plugin: PluginContext, incomingMessage: IncomingMessage<any>) {
        Logger.silly(`Sending message to ${plugin.name}`);
        let message;
        try {
            message = await plugin.instance.onMessage(incomingMessage);
        }
        catch (err) {
            Logger.error(`Error when executing "onMessage" on Plugin ${plugin.name}`, err);
            message = this.t('internal-error');
        }

        // Explicitly check if it really is a string
        // .. so Google Home say accidiantly an object
        if (message) {
            let data: DialogflowResponse;
            if (typeof message === 'string') {
                data = { fulfillmentText: message };
            } else {
                data = message;
            }
            try {
                this.messageHandler.sendMessage({ requestId: incomingMessage.requestId, data });
            }
            catch (err) {
                Logger.error(`Fatal error! Could not send message!`);
            }
        } else {
            Logger.warn(`Plugin ${plugin.name} did not return any message when "onMessage" was called`);
        }
    }

    private async onMessagePlugins(data: IncomingMessage<any>) {
        const usablePlugins = this.plugins
            .filter(plugin => this.isMessageCompatibleWithPlugin(plugin, data));
        Logger.silly(`Found ${usablePlugins.length} usablePlugins ${usablePlugins.map(plugin => plugin.name)}`);
        await map(usablePlugins, async plugin => await this.executeOnMessageOfPlugin(plugin, data));
    }

    private async onMessageReceive(data) {
        Logger.info(data);
        let parsedData: IncomingMessage<any>;
        try {
            parsedData = JSON.parse(data) as IncomingMessage<any>;
        }
        catch (ex) {
            return Logger.error('Could not parse data', ex);
        }

        try {
            await this.translationHandler.changeLanguage(parsedData.data.languageCode);
        }
        catch (err) {
            Logger.warn(`User tried to change language to ${parsedData.data.languageCode}. Using fallback instead.`);
            Logger.warn(err);
        }
        await this.onMessagePlugins(parsedData);

    }

    async bootstrap() {
        if (DRY_RUN) {
            Logger.warn('Running in DRY_RUN mode!');
        }
        await this.onInitPlugins();
        try {
            this.t = await this.translationHandler.bootstrap();
        } catch (err) {
            Logger.error(err);
            process.exit(1);
        }
        this.messageHandler.onMessage().subscribe(data => this.onMessageReceive(data));
        this.messageHandler.connect();
    }
}
