import { getFixedT } from 'i18next';

export class DistributionNotFoundError extends Error {
    constructor(distribution: string) {
        const t = getFixedT(null, 'openstack');
        super(t('distribution-not-found', { distribution }));
    }
}
