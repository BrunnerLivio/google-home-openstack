import { getFixedT } from 'i18next';
import { OpenstackError } from './openstack.error';

export class SizeDoesNotExistError extends OpenstackError {
    constructor(size: string) {
        const t = getFixedT(null, 'openstack');
        super(t('size-does-not-exist', { size }));
    }
}
