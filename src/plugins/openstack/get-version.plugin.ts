import { GoogleHomePlugin, IGoogleHomePlugin } from '../../core/google-home-plugin';
import { IncomingMessage } from "../../common/incoming-message.interface";
import { join } from 'path';
import { readJson } from 'fs-promise';
import { TranslationFunction, getFixedT } from 'i18next';

export class GetVersionParameters {
    'get-version': boolean;
}

export type GetVersionMessage = IncomingMessage<GetVersionParameters>;

@GoogleHomePlugin({
    requiredParameters: [
        'get-version'
    ]
})
export class GetVersionPlugin implements IGoogleHomePlugin {
    private t: TranslationFunction;

    constructor() {
        this.t = getFixedT(null, 'openstack');
    }

    private async getPackageJSON(): Promise<any> {
        const currentPath = join(__dirname, '../../../package.json');
        return await readJson(currentPath);
    }

    public async onMessage(message: GetVersionMessage): Promise<string> {
        try {
            const packageJson = await this.getPackageJSON();
            return this.t('current-version', { version: packageJson.version });
        }
        catch (err) {
            return this.t('internal-error', { ns: 'common' });
        }
    }
}
