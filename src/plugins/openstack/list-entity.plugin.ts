import * as fileSize from 'file-size';
import { converterBase10 } from 'byte-converter';

import { humanizeList } from '../../util/humanize-list';
import { GoogleHomePlugin, IGoogleHomePlugin } from '../../core/google-home-plugin';
import { OpenstackService } from './openstack.service';
import { OpenstackConfig } from '../../common/app-settings.interface';
import { ConfigService } from '../../core/config.service';
import { IncomingMessage } from "../../common/incoming-message.interface";
import * as i18next from 'i18next';

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

    constructor() {
        this.openstack = OpenstackService.Instance;
        this.config = ConfigService.getConfig().openstack;
        this.t = i18next.getFixedT(null, 'openstack');
    }

    private async listAllDistributions() {
        const images = await this.openstack.listImages();
        const distributions = humanizeList(images.map(image => image.name));
        return this.t('available-distributions', { distributions });
    }

    private async listAllSizes() {
        const sizes = Object.keys(this.config.sizes);
        const flavors = await this.openstack.listFlavors();
        const sizesFormatted = sizes.map(size => {
            const flavorId = this.config.sizes[size];
            const flavor = flavors.find(flavor => flavor.id === flavorId);
            const ram = fileSize(converterBase10(Math.floor(flavor.ram / 1000) * 1000, 'MB', 'B')).human('si');
            return this.t('the-size', { size, disk: flavor.disk, ram }) + ' ';
        });
        return this.t('available-sizes', { sizes: humanizeList(sizesFormatted) });
    }

    async onMessage(message: ListEntityMessage): Promise<string> {
        const openstackEntity = message.data.parameters["openstack-entity"];
        let data: string = this.t('not-understand', { ns: 'common' });
        switch (openstackEntity) {
            case 'distribution':
                data = await this.listAllDistributions();
                break;
            case 'size':
                data = await this.listAllSizes();
                break;
        }
        return data;
    }
}
