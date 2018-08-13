import { readFileSync } from 'fs';
import { join } from 'path';

import * as yaml from 'js-yaml';

import { Welcome } from './util/welcome-message';
import { GoogleHomeOpenstack } from './main';
import { Logger } from './util/logger';

// Import openstack plugins
import './plugins/openstack';

import { AppSettings } from './common/app-settings.interface';


const PrintVersion = () => {
    const packageJson = require('../package.json');
    Logger.info(`Running on version v${packageJson.version}`);
}

const Run = () => {
    Welcome();
    PrintVersion();
    try {
        // Read Config
        const configPath = process.env.CONFIG || join(__dirname, '../config.yml');
        const config: AppSettings = yaml.safeLoad(readFileSync(configPath, 'utf8')) as AppSettings;
        new GoogleHomeOpenstack(config).bootstrap();
    }
    catch (ex) {
        Logger.error('Failed during bootstrap ' + ex);
    }
}

Run();
