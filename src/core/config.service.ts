import { AppSettings } from "../common/app-settings.interface";
import { Logger } from "../util/logger";

export class ConfigService {
    private static config;
    static setConfig(config: AppSettings) {
        Logger.silly('Set app settings');
        this.config = config;
    }

    static getConfig(): AppSettings {
        Logger.silly('Request app settings');
        return this.config;
    }
}
