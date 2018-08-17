import { getFixedT } from 'i18next';
import { OpenstackError } from './openstack.error';

export class VersionNotFoundError extends OpenstackError {
    constructor(distribution: string, version: string) {
        const t = getFixedT(null, 'openstack')
        super(t('wrong-distribution-version-combo', { distribution, version }));
    }
}
