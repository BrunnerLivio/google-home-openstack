import { getFixedT } from 'i18next';
import { OpenstackError } from './openstack.error';

export class DistributionNotFoundError extends OpenstackError {
    constructor(distribution: string) {
        const t = getFixedT(null, 'openstack');
        super(t('distribution-not-found', { distribution }));
    }
}
