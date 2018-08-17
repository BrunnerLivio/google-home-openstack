import { join, resolve } from 'path';
import * as i18next from 'i18next';
import * as Backend from 'i18next-node-fs-backend';
import { Logger } from '../util/logger';

const LANG = process.env.GHO_LANG || 'en';

export class TranslationHandler {
    public async bootstrap(): Promise<any | i18next.TranslationFunction> {
        const loadPath = join(__dirname, '../../locales/{{lng}}/{{ns}}.json');
        return new Promise((resolve, reject) => {
            Logger.silly(`Use language "${LANG}"`);
            Logger.silly(`Using language files ${loadPath}`);
            i18next
                .use(Backend)
                .init({
                    ns: ['common', 'openstack'],
                    fallbackNS: 'common',
                    fallbackLng: LANG,
                    lng: LANG,
                    backend: {
                        loadPath: loadPath,
                        jsonIndent: 4
                    }
                }, (err, t) => {
                    Logger.debug(`Successfully language loaded "${LANG}"`);
                    return resolve(t);
                });
        });
    }

    public async changeLanguage(lang: string): Promise<any>{
        return new Promise((resolve, reject) => {
            if (i18next.language === lang) return resolve();
            Logger.silly(`Changing language from ${i18next.language} to ${lang}`);
            i18next.changeLanguage(lang, (err, t) => {
                if (err) return reject(err);
                return resolve(t);
            });
        });
    }
}
