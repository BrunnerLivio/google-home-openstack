import { GoogleHomePluginSettings, IGoogleHomePlugin } from './google-home-plugin';
import { Type } from '../common/type.interface';

export interface PluginContext {
    settings: GoogleHomePluginSettings;
    instance?: IGoogleHomePlugin;
    type: Type<IGoogleHomePlugin>
    name?: string
}

export class PluginRegister {
    private static plugins: PluginContext[] = new Array<PluginContext>();
    private static pluginTypes: Type<IGoogleHomePlugin>[] = new Array<Type<IGoogleHomePlugin>>();
    private static pluginsInitialized = false;
    public static register(plugin: Type<IGoogleHomePlugin>, settings: GoogleHomePluginSettings) {
        this.plugins.push({
            type: plugin,
            settings,
        });
    }
    public static getPlugins(): PluginContext[] {
        if (!this.pluginsInitialized) {
            this.plugins = this.plugins.map((plugin): PluginContext => {
                const instance = new plugin.type();
                const name = instance.constructor.name;
                return {
                    instance,
                    name,
                    settings: plugin.settings,
                    type: plugin.type
                }
            });
        }
        return this.plugins;
    }
}
