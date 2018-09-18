import { GoogleHomePlugin, IGoogleHomePlugin } from '../../core/google-home-plugin';
import { IncomingMessage } from "../../common/incoming-message.interface";
import { TranslationFunction, getFixedT } from 'i18next';
import { OpenstackService } from './openstack.service';
import { forEach } from 'p-iteration';

export class RemoveAllParameters {
    'remove-all': string;
}

export type RemoveAllMessage = IncomingMessage<RemoveAllParameters>;

@GoogleHomePlugin({
    requiredParameters: [
        'remove-all'
    ]
})
export class RemoveAllPlugin implements IGoogleHomePlugin {
    private t: TranslationFunction;
    private openstack: OpenstackService;

    constructor() {
        this.openstack = OpenstackService.Instance;
        this.t = getFixedT(null, 'openstack');
    }

    async onMessage(message: RemoveAllMessage): Promise<string> {
        const servers = (await this.openstack.fetchServers()) || [];
        forEach(servers, async (server: any) => await this.openstack.removeServer(server.id));
        return this.t('digital-transformation');
    }
}
