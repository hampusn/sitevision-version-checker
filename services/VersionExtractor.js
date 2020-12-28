const cheerio = require('cheerio');
const math = require('../helpers/math');
const { HASH_DICT =  '' } = process.env;
const PAIR_DELIM = ',';
const KEYVAL_DELIM = ':';

class VersionExtractor {
  constructor (body) {
    this._body = body;
    this._dict = this.parseDict(HASH_DICT, PAIR_DELIM, KEYVAL_DELIM);
  }

  parseDict (dictString, pairDelim, keyvalDelim) {
    return dictString
      .split(pairDelim)
      .map(pairStr => pairStr.split(keyvalDelim))
      .reduce((dict, [ k, v ]) => {
        if (k && v) {
          dict[k] = v;
        }

        return dict;
      }, {});
  }

  execute () {
    const $ = cheerio.load(this._body);
    const extracted = {
      version: '',
      exactVersion: false
    };

    const pageContextScript = $('head').find('script:not(:empty)').toArray()
      .map(tag => $(tag).html() + '')
      .filter(tag => tag.includes('sv.PageContext = {'))
      .pop();

    if (pageContextScript) {
      let res = pageContextScript.match(/versionPath: '(.*)'/);
      if (res && res[1]) {
        extracted.version = res[1];
        extracted.exactVersion = true;
      }
    }
    
    if (!extracted.version) {
      let versions = $('head').find('link[type="text/css"][href^="/sitevision/"]').map((i, el) => {
        let matches = $(el).attr('href').match(/\/sitevision\/(.*?)\//);

        if (matches && matches.length === 2) {
          return matches[1];
        }

        return "";
      }).get();

      extracted.version = math.mode(versions);
      extracted.exactVersion = false;
    }

    // Handle version hashes.
    if (extracted.version && !extracted.version.includes('.') && extracted.version.length > 10) {
      extracted.version = this._dict[extracted.version] || '';
      extracted.exactVersion = !!extracted.version;
    }

    return extracted;
  }
}

module.exports = VersionExtractor;
