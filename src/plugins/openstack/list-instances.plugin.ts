import { GoogleHomePlugin, IGoogleHomePlugin } from '../../core/google-home-plugin';
import { IncomingMessage } from "../../common/incoming-message.interface";
import { OpenstackService } from './openstack.service';
import { Logger } from '../../util/logger';
import { humanizeList } from '../../util/humanize-list';
import { TranslationFunction, getFixedT } from 'i18next';

export interface ListInstancesParameters {
    'instance-running': string;
}

export type ListInstancesMessage = IncomingMessage<ListInstancesParameters>;

@GoogleHomePlugin({
    requiredParameters: [
        'instance-running'
    ]
})
export class ListInstancesPlugin implements IGoogleHomePlugin {
    private openstack: OpenstackService;
    private t: TranslationFunction;


    constructor() {
        this.openstack = OpenstackService.Instance;
        this.t = getFixedT(null, 'openstack');
    }

    private async getFormattedRunningServers() {
        const servers = await this.openstack.fetchServers() || [];
        const instancesLength = servers.length;

        if (instancesLength === 0) {
            return this.t('no-running-instance')
        }

        const serverNames = humanizeList(servers.map(server => server.name));

        if (instancesLength === 1) {
            return this.t('one-running-instance', { serverNames })
        }

        return this.t('multiple-running-instances', { instancesLength, serverNames });
    }

    async onMessage(): Promise<string> {
        let data = '';
        try {
            data = await this.getFormattedRunningServers();
        }
        catch (err) {
            Logger.error('Could not format running servers', err);
            data = this.t('internal-error', { ns: 'common' });
        }
        return data;
    }
}
