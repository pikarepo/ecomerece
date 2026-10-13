import { BadRequestError } from '../../../apps/api/errors/app-error';
import { StringVO } from './string-vo';

export class UrlVO extends StringVO {
  constructor(value: string) {
    super(value.trim());

    const schemeMatch = this.value.match(/^([a-z][a-z0-9+\-.]*):/i);
    if (!schemeMatch) {
      throw new BadRequestError('Invalid URL.');
    }

    const scheme = schemeMatch[1].toLowerCase();
    if (scheme !== 'http' && scheme !== 'https') {
      throw new BadRequestError('URL must use the HTTP or HTTPS protocol.');
    }

    try {
      new URL(this.value);
    } catch {
      throw new BadRequestError('Invalid URL.');
    }
  }

  static create(url: string) {
    return new UrlVO(url);
  }
  static rehydrate(url: string) {
    return new UrlVO(url);
  }
}
