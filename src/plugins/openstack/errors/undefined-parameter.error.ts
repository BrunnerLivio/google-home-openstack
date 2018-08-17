import { getFixedT } from 'i18next';
import { OpenstackError } from './openstack.error';

export class UndefinedParameterError extends OpenstackError {
    constructor(parameterName: string) {
        super(parameterName);
    }
}
