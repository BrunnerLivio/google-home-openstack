import * as fileSize from 'file-size';
import { converterBase10 } from 'byte-converter';

import { humanizeList } from '../../util/humanize-list';
import { GoogleHomePlugin, IGoogleHomePlugin } from '../../core/google-home-plugin';
import { OpenstackService } from './openstack.service';
import { OpenstackConfig } from '../../common/app-settings.interface';
import { ConfigService } from '../../core/config.service';
import { IncomingMessage } from "../../common/incoming-message.interface";
import * as i18next from 'i18next';
import { OpenstackHumanService } from './openstack-human.service';

export type OpenstackEntity = 'distribution' | 'version' | 'size';

export interface ListEntityParameters {
    'openstack-entity': OpenstackEntity;
    'list-entity': string;
}

export type ListEntityMessage = IncomingMessage<ListEntityParameters>;

@GoogleHomePlugin({
    requiredParameters: [
        'list-entity'
    ]
})
export class ListEntityPlugin implements IGoogleHomePlugin {
    private openstack: OpenstackService;
    private config: OpenstackConfig;
    private t: i18next.TranslationFunction;
    private openstackHuman: OpenstackHumanService;

    constructor() {
        this.openstack = OpenstackService.Instance;
        this.openstackHuman = OpenstackHumanService.Instance;
        this.config = ConfigService.getConfig().openstack;
        this.t = i18next.getFixedT(null, 'openstack');
    }



    async onMessage(message: ListEntityMessage): Promise<string> {
        const openstackEntity = message.data.parameters["openstack-entity"];
        let data: string = this.t('not-understand', { ns: 'common' });
        switch (openstackEntity) {
            case 'distribution':
                data = await this.openstackHuman.listAllDistributions();
                break;
            case 'size':
                data = await this.openstackHuman.listAllSizes();
                break;
        }
        return data;
    }
}
