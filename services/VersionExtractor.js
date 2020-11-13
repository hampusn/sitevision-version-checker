const cheerio = require('cheerio');
const math = require('../helpers/math');

class VersionExtractor {
  constructor (body) {
    this._body = body;
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

    // Sanity check. ¯\_(ツ)_/¯
    if (extracted.version && extracted.version.length > 30) {
      extracted.version = '';
      extracted.exactVersion = false;
    }

    return extracted;
  }
}

module.exports = VersionExtractor;
