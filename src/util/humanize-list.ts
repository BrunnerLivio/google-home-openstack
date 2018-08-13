import * as humanizeListCore from 'humanize-list';
import * as i18next from 'i18next';

export const humanizeList = (list: string[], params?: any) =>
    humanizeListCore(list, { ...params, conjunction: i18next.t('and', { ns: 'common' }) });
