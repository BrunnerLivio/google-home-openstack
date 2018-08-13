import { GoogleHomePlugin, IGoogleHomePlugin } from '../../core/google-home-plugin';
import { OpenstackService } from './openstack.service';
import { OpenstackConfig, Sizes, Distribution, Version } from '../../common/app-settings.interface';
import { ConfigService } from '../../core/config.service';
import { DistributionNotFoundError, VersionNotFoundError, SizeDoesNotExistError } from './errors';
import { IncomingMessage } from '../../common/incoming-message.interface';
import * as i18next from 'i18next';
import { Logger } from '../../util/logger';


export type VMSize = 'small' | 'medium' | 'large';

export interface CreateVMParameters {
    size: VMSize;
    distributions: string;
    version: string;
    'vm-name': string;
    'vm-location': string;
    'vm-port': string;
    'create-vm': string;
}

export type CreateVMMessage = IncomingMessage<CreateVMParameters>;


@GoogleHomePlugin({
    requiredParameters: [
        'create-vm'
    ]
})
export class CreateVMPlugin implements IGoogleHomePlugin {
    private openstack: OpenstackService;
    private config: OpenstackConfig;
    private t: i18next.TranslationFunction;

    constructor() {
        this.openstack = OpenstackService.Instance;
        this.config = ConfigService.getConfig().openstack;
        this.t = i18next.getFixedT(null, 'openstack');
    }

    private getFlavorBySize(size: VMSize): string {
        const newSize = this.config.sizes[size];
        if (!newSize) {
            throw new SizeDoesNotExistError(size);
        }
        return newSize;
    }

    private getDistribution(distribution: string) {
        const dist = this.config.distributions.find(d => d.name === distribution);
        if (!dist) {
            throw new DistributionNotFoundError(distribution);
        }
        return dist;
    }

    getVersion(distribution: Distribution, version: string): Version {
        const vers = distribution.versions.find(v => v.name === version);
        if (!vers) {
            throw new VersionNotFoundError(distribution.name, version);
        }
        return vers;
    }

    mapOpenstackParams(params: CreateVMParameters) {
        let flavorRef, distribution, version, imageRef;
        if (params.size) {
            flavorRef = this.getFlavorBySize(params.size);
        }
        if (params.distributions) {
            distribution = this.getDistribution(params.distributions);
        }
        if (params.version) {
            version = this.getVersion(distribution, params.version);
            imageRef = version.ref;
        }

        return {
            name: params["vm-name"],
            flavorRef,
            imageRef: imageRef,
            networks: [{
                uuid: '8105a814-769e-46a2-96b1-7579195ad76f'
            }]
        };
    }

    async onMessage(message: CreateVMMessage): Promise<string> {
        const params = message.data.parameters;
        let server;
        try {
            server = this.mapOpenstackParams(params);
            await this.openstack.createServer(server);
        }
        catch (err) {
            if (err instanceof VersionNotFoundError) {
                return err.message;
            } else {
                Logger.error(err);
                return this.t('internal-error', { ns: 'common' });
            }
        }

        return this.t('created-vm', { name: params["vm-name"] });
    }

    async onInit() {
        await this.openstack.updateToken();
    }
}
