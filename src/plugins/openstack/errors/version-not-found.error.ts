import { getFixedT } from 'i18next';

export class VersionNotFoundError extends Error {
    constructor(distribution: string, version: string) {
        const t = getFixedT(null, 'openstack')
        super(t('wrong-distribution-version-combo', { distribution, version }));
    }
}
