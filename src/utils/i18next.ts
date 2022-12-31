import { Application } from 'express';
import path from 'path';
import i18next from 'i18next';
import Backend from 'i18next-node-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';

interface I18nextOptions {
  app: Application;
}

class I18nManager {
  t: unknown;
  init = ({ app }: I18nextOptions) => {
    i18next
      .use(Backend)
      .use(i18nextMiddleware.LanguageDetector)
      .init({
        backend: {
          loadPath: path.resolve(__dirname, '../locales/{{lng}}/{{ns}}.json'),
        },
        fallbackLng: 'en',
        saveMissing: true,
        preload: ['en', 'ar'],
      });

    this.t = i18next.t;

    if (app) app.use(i18nextMiddleware.handle(i18next));
  };
}

export const i18n = new I18nManager();
