export interface FloatingIPCreateDto {
    floating_ip: FloatingIP;
}

export interface FloatingIP {
    fixed_ip:    null;
    id:          number;
    instance_id: null;
    ip:          string;
    pool:        string;
}
