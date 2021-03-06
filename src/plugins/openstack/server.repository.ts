class Server {
    private id: string;
    constructor(id) {
        this.id = id;
    }
}

export class ServerRepository {
    private server;
    constructor() {
        this.server = [];
    }
    setServers(servers) {
        this.server = servers.map(server => new Server(server.id));
    }

    addServer(server) {
        this.server.push(new Server(server.id));
    }

    shiftServer() {
        return this.server.shift();
    }

    count() {
        return this.server.length;
    }
}
