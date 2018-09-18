import { GoogleHomePlugin, IGoogleHomePlugin } from '../../core/google-home-plugin';
import { OpenstackService } from './openstack.service';
import { OpenstackConfig, Sizes, Distribution, Version } from '../../common/app-settings.interface';
import { ConfigService } from '../../core/config.service';
import { DistributionNotFoundError, VersionNotFoundError, SizeDoesNotExistError, UndefinedParameterError } from './errors';
import { OpenstackError } from './errors/openstack.error';
import { IncomingMessage } from '../../common/incoming-message.interface';
import * as i18next from 'i18next';
import { Logger } from '../../util/logger';
import { DialogflowResponse } from '../../common/dialogflow-response';
import { OpenstackHumanService } from './openstack-human.service';
import { FloatingIPCreateDto } from './interfaces';

export type VMSize = 'small' | 'medium' | 'large';

export interface CreateVMParameters {
    size: VMSize;
    distributions: string;
    version: string;
    count: number;
    'vm-name': string;
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
    private openstackHuman: OpenstackHumanService;

    constructor() {
        this.openstack = OpenstackService.Instance;
        this.openstackHuman = OpenstackHumanService.Instance;
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
        if (!params.distributions) {
            throw new UndefinedParameterError(this.t('questions.distribution'))
        }

        distribution = this.getDistribution(params.distributions);

        if (!params.version) {
            throw new UndefinedParameterError(this.t('questions.version'));
        }

        imageRef = this.getVersion(distribution, params.version).ref;

        if (!params.size) {
            const sizes = this.openstackHuman.listAllSizes();
            throw new UndefinedParameterError(this.t('questions.size', { sizes }));
        }

        flavorRef = this.getFlavorBySize(params.size);

        if (!params["vm-name"]) {
            throw new UndefinedParameterError('name');
        }

        return {
            name: params["vm-name"],
            flavorRef,
            imageRef: imageRef,
            networks: [{
                uuid: this.config.defaultNetworkUUID
            }],
            key_name: this.config.defaultKeyPairName
        };
    }

    async onMessage(message: CreateVMMessage): Promise<DialogflowResponse> {
        const params = message.data.parameters;
        let server;
        let serverCount = params.count || 1;
        let serverCreated = 0;
        try {
            server = this.mapOpenstackParams(params);
            for (serverCreated = 0; serverCreated < serverCount; serverCreated++) {
                const newServer = await this.openstack.createServer(server);
                const floatingIp: FloatingIPCreateDto = await this.openstack.createFloatingIP(this.config.defaultFloatingIpPool);
                // TODO: Check state of vm instead of timeout
                window.setTimeout(async () => await this.openstack.associateFloatingIp(newServer.id, floatingIp.ip), 1500);
            }
        }
        catch (err) {
            if (err instanceof OpenstackError) {
                return {
                    fulfillmentText: err.message,
                };
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
