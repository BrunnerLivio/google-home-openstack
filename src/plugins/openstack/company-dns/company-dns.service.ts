import axios from 'axios';
import { AppSettings } from '../../../common/app-settings.interface';
import { Logger } from '../../../util/logger';
export class CompanyDNSService {
    constructor(private config: AppSettings) { }
    async setupDNS(name: string, address: string) {
        Logger.info(`Setting up DNS for ${name} IP ${address} on ${this.config.companyDNSAPIAddress}`);
        return await axios.post(
            this.config.companyDNSAPIAddress,
            { Name: name, Address: address, Port: 53, ID: name }
        );
    }
}
