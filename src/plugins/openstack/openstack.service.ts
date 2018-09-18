import { ServerRepository } from './server.repository';

import * as  OSWrap from 'openstack-wrapper';
import { Logger } from '../../util/logger';
import { ConfigService } from '../../core/config.service';
import { OpenstackConfig } from '../../common/app-settings.interface';
import { FloatingIPCreateDto } from './interfaces';

type Token = { token: string, expires_at: Date };
const DRY_RUN = process.env.DRY_RUN === 'true';

export class OpenstackService {
    private keystone: any;
    private general_token: Token;
    private nova: OSWrap.Nova;
    private project_token: string;
    private glance: OSWrap.Glance;
    private config: OpenstackConfig;
    private static instance: OpenstackService;
    private tokenRetries: number = 0;
    private tokenTimeout: NodeJS.Timer;
    serverRepository: ServerRepository;
    constructor() {
        this.config = ConfigService.getConfig().openstack;
        Logger.silly('Creating keystone server with address ' + this.config.servers.keystone);
        this.keystone = new OSWrap.Keystone(this.config.servers.keystone);
        this.serverRepository = new ServerRepository();
    }

    private getToken(): Promise<Token> {
        return new Promise((resolve, reject) => {
            const { username, password, domain } = this.config;
            Logger.debug(`Logging in with user "${username}" on domain "${domain}"`);
            this.keystone.getToken(username, password, domain,
                async (error, token: Token) => {
                    if (error) {
                        Logger.error('Error when trying to get token');
                        if (this.tokenRetries > 2) {
                            return reject(error);
                        } else {
                            this.tokenRetries++;
                            const token = await this.getToken();
                            this.general_token = token;
                            resolve(token);
                        }
                    }
                    this.general_token = token;
                    resolve(token);
                });
        });
    }

    private getProjectTokenById() {
        return new Promise((resolve, reject) => {
            this.keystone
                .getProjectTokenById(this.general_token.token,
                    this.config.projectId,
                    (error, token) => {
                        if (error) {
                            reject(error);
                        } else {
                            this.project_token = token;
                            Logger.silly(`Creating a new Nova instance with address ${this.config.servers.nova} and token ${token.token}`);
                            this.nova = new OSWrap.Nova(this.config.servers.nova, token.token);
                            Logger.silly(`Creating a new Glance instance with address ${this.config.servers.glance} and token ${token.token}`);
                            this.glance = new OSWrap.Glance(this.config.servers.glance, token.token);
                            resolve(token);
                        }
                    });
        });
    }

    private getTokenDeathTime(): number {
        return new Date(this.general_token.expires_at).getTime() - new Date().getTime();
    }

    private hasTokenExpired() {
        if (!this.general_token) return true;
        return new Date(this.general_token.expires_at) < new Date();
    }

    public static get Instance() {
        return OpenstackService.instance || (OpenstackService.instance = new OpenstackService());
    }

    async updateToken() {
        await this.getToken();
        await this.getProjectTokenById();
        const timeout = this.getTokenDeathTime();
        Logger.debug(`Updated token and set timeout to ${this.getTokenDeathTime()}ms`);
        clearTimeout(this.tokenTimeout);
        this.tokenTimeout = setTimeout(() => this.updateToken(), timeout);
    }

    async fetchServers(): Promise<any | any[]> {
        if (this.hasTokenExpired()) {
            await this.updateToken();
        }
        return new Promise((resolve, reject) => {
            if (DRY_RUN) {
                return resolve([]);
            }
            this.nova.listServers((error, servers) => {
                if (error) {
                    reject(error);
                } else {
                    this.serverRepository.setServers(servers);
                    resolve(servers);
                }
            });
        });
    }

    async createServer(settings): Promise<any> {
        if (this.hasTokenExpired()) {
            await this.updateToken();
        }
        return new Promise((resolve, reject) => {
            Logger.info('Creating a new server');
            Logger.debug('Creating server with settings ' + JSON.stringify(settings));
            if (DRY_RUN) {
                return resolve();
            }
            this.nova.createServer({
                server: settings
            }, (error, server) => {
                if (error) {
                    const remoteCode = error.detail.remoteCode;
                    if (remoteCode >= 400 && remoteCode <= 404 || remoteCode === 409) {
                        Logger.error('Error while creating server', error);
                        return reject(error.detail.remoteMessage);
                    }
                } else {
                    Logger.debug('Created server');
                    resolve(server);
                }
            });
        });
    }

    async createFloatingIP(pool: string): Promise<FloatingIPCreateDto | any> {
        return new Promise((resolve, reject) => {
            Logger.info(`Create a new floating IP in the pool ${pool}`);
            this.nova.createFloatingIp({ pool }, (error, result) => {
                if (error) {
                    const remoteCode = error.detail.remoteCode;
                    if (remoteCode >= 400 && remoteCode <= 404 || remoteCode === 409) {
                        Logger.error('Error while creating a floating IP', error);
                        return reject(error.detail.remoteMessage);
                    }
                } else {
                    Logger.debug('Created a floating IP');
                    return resolve(result);
                }
            });
        });
    }

    async associateFloatingIp(serverId: string, ipAddress: string) {
        return new Promise((resolve, reject) => {
            Logger.info(`Associating floating IP ${ipAddress} with server ${serverId}`);
            this.nova.associateFloatingIp(serverId, ipAddress, (error, response) => {
                if (error) {
                    const remoteCode = error.detail.remoteCode;
                    if (remoteCode >= 400 && remoteCode <= 404 || remoteCode === 409) {
                        Logger.error('Error while associating IP', error);
                        return reject(error.detail.remoteMessage);
                    }
                } else {
                    Logger.debug('Associated a floating IP');
                    resolve((response));
                }
            });
        });
    }

    async listFlavors(): Promise<any | any[]> {
        if (this.hasTokenExpired()) {
            await this.updateToken();
        }
        return new Promise((resolve, reject) => {
            Logger.debug('Listing flavors');
            if (DRY_RUN) {
                return resolve();
            }
            this.nova.listFlavors((error, server) => {
                if (error) {
                    Logger.error('Error while listing flavors', error);
                    reject(error);
                } else {
                    Logger.debug('Listed flavors');
                    resolve(server);
                }
            });
        });
    }

    async listImages(): Promise<any | any[]> {
        if (this.hasTokenExpired()) {
            await this.updateToken();
        }
        return new Promise((resolve, reject) => {
            Logger.debug('Listing images');
            if (DRY_RUN) {
                return resolve();
            }
            this.glance.listImages((error, images) => {
                if (error) {
                    Logger.error('Error while listing images', error);
                    return reject(error);
                }
                Logger.debug('Listed images');
                resolve(images);
            });
        });
    }
    async removeServer() {
        if (this.hasTokenExpired()) {
            await this.updateToken();
        }
        return new Promise((resolve, reject) => {
            if (DRY_RUN) {
                return resolve();
            }
            let serverToDelete = this.serverRepository.shiftServer();
            if (!serverToDelete) {
                reject('No Servers left!');
                return;
            }
            this.nova.removeServer(serverToDelete.id, (error, data) => {
                if (error) {
                    this.serverRepository.addServer(serverToDelete);
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
}
