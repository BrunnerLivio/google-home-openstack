import * as fileSize from 'file-size';
import * as i18next from 'i18next';
import { converterBase10 } from 'byte-converter';

import { humanizeList } from '../../util/humanize-list';
import { OpenstackService } from "./openstack.service";
import { ConfigService } from "../../core/config.service";
import { OpenstackConfig } from "../../common/app-settings.interface";

export class OpenstackHumanService {
    private config: OpenstackConfig;
    private openstack: OpenstackService;
    private t: i18next.TranslationFunction;
    private static instance: OpenstackHumanService;

    constructor() {
        this.config = ConfigService.getConfig().openstack;
        this.openstack = OpenstackService.Instance;
        this.t = i18next.getFixedT(null, 'openstack');
    }

    public static get Instance() {
        return OpenstackHumanService.instance || (OpenstackHumanService.instance = new OpenstackHumanService());
    }

    private formatSizes(sizes: string[], flavors: any) {
        return sizes.map(size => {
            const flavorId = this.config.sizes[size];
            const flavor = flavors.find(flavor => flavor.id === flavorId);
            const ram = fileSize(converterBase10(Math.floor(flavor.ram / 1000) * 1000, 'MB', 'B')).human('si');
            return this.t('the-size', { size, disk: flavor.disk, ram }) + ' ';
        });
    }

    public async listAllSizes() {
        const sizes = Object.keys(this.config.sizes);
        const flavors = await this.openstack.listFlavors();
        const sizesFormatted = this.formatSizes(sizes, flavors);
        return this.t('available-sizes', { sizes: humanizeList(sizesFormatted) });
    }

    public async listAllDistributions() {
        const images = await this.openstack.listImages();
        const distributions = humanizeList(images.map(image => image.name));
        return this.t('available-distributions', { distributions });
    }
}
