export interface AppSettings {
    adafruit: Adafruit;
    openstack: OpenstackConfig;
    companyDNSAPIAddress: string;
    companyDNSDomain: string;
}

export interface Adafruit {
    host: string;
    port: number;
    key: string;
    username: string;
    feedIdIn: string;
    feedIdOut: string;
}

export interface OpenstackConfig {
    username: string;
    password: string;
    projectId: string;
    domain: string;
    servers: Servers;
    sizes: Sizes;
    defaultFloatingIpPool: string;
    defaultKeyPairName: string;
    defaultNetworkUUID: string
    distributions: Distribution[];
    associatingIpSleep: number;
    maxAssociatingIpRetries: number;
}

export interface Distribution {
    name: string;
    versions: Version[];
}

export interface Version {
    name: string;
    ref: string;
}

export interface Servers {
    glance: string;
    nova: string;
    keystone: string;
}

export interface Sizes {
    small: string;
    medium: string;
    large: string;
}
