import { PluginRegister } from './plugin-register';
import { Type } from '../common/type.interface';
import { DialogflowResponse } from '../common/dialogflow-response';

export interface IGoogleHomePlugin {
    onMessage(message: any): Promise<string | DialogflowResponse | void>;
    onInit?: () => Promise<any>;
}

export interface GoogleHomePluginSettings {
    requiredParameters?: string[];
}

export function GoogleHomePlugin(settings?: GoogleHomePluginSettings) {
    return (plugin: Type<IGoogleHomePlugin>) => {
        PluginRegister.register(plugin, settings);
    }
}
