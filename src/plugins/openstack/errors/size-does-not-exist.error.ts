import { getFixedT } from 'i18next';

export class SizeDoesNotExistError extends Error {
    constructor(size: string) {
        const t = getFixedT(null, 'openstack');
        super(t('size-does-not-exist', { size }));
    }
}
