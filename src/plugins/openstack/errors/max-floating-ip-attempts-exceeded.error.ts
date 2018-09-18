import { getFixedT } from 'i18next';
import { OpenstackError } from './openstack.error';

export class MaxFloatingIpAttemptsExceededError extends OpenstackError {
    constructor() {
        const t = getFixedT(null, 'openstack');
        super(t('max-floating-ip-attempts-exceeded'));
    }
}
