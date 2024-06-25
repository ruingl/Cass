var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs-extra');

var EMAIL = process.env['EMAIL'];
var PASS = process.env['PASS'];

var getState = function() {
  return new Promise(function(resolve, reject) {
    if (!EMAIL || !PASS) {
      try {
        resolve(fs.readJSONSync(`${__dirname}/../LIB/STATE.json`));
      } catch (err) {
        reject(err);
      }
    } else {
      var url = 'https://mbasic.facebook.com';
      var xurl = url + '/login.php';
      var userAgent = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';
      var headers = {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'max-age=0',
        'sec-ch-ua': '"Chromium";v="94", "Google Chrome";v="94", ";Not A Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent': userAgent
      };

      var jar = request.jar();

      try {
        var body = request({ url: xurl, headers: headers, jar: jar, simple: false, resolveWithFullResponse: true });

        var $ = cheerio.load(body);
        var lsd = $('input[name="lsd"]').val();
        var jazoest = $('input[name="jazoest"]').val();
        var m_ts = $('input[name="m_ts"]').val();
        var li = $('input[name="li"]').val();
        var try_number = $('input[name="try_number"]').val();
        var unrecognized_tries = $('input[name="unrecognized_tries"]').val();
        var bi_xrwh = $('input[name="bi_xrwh"]').val();

        var formData = {
          lsd: lsd,
          jazoest: jazoest,
          m_ts: m_ts,
          li: li,
          try_number: try_number,
          unrecognized_tries: unrecognized_tries,
          bi_xrwh: bi_xrwh,
          email: EMAIL,
          pass: PASS,
          login: "submit"
        };

        var response = request.post({ url: xurl, headers: headers, form: formData, followAllRedirects: true, timeout: 300000, jar: jar, simple: false, resolveWithFullResponse: true });

        var cookies = jar.getCookies(url);
        var cok = cookies.map(cookie => ({
          key: cookie.key,
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path,
          hostOnly: !cookie.domain.startsWith('.'),
          creation: new Date().toISOString(),
          lastAccessed: new Date().toISOString()
        }));
        var fbstate = JSON.stringify(cok);

        if (cok.some(cookie => cookie.key === "c_user")) {
          resolve(fbstate);
        } else {
          reject(new Error("Incorrect email / password!"));
        }
      } catch (err) {
        reject(err);
      }
    }
  });
}

module.exports = { getState };