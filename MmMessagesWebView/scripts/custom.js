
/* 
 * Return outerHTML for the first element in a jQuery object,
 * or an empty string if the jQuery object is empty;  
 * Useful for debugging
 */
jQuery.fn.outerHTML = function() {
   return (this[0]) ? this[0].outerHTML : '';  
};

var DEFAULT_URL = "file:///Users/me/Library/Application Support/MailMate/Resources/MmMessagesWebView/user.png";

function debug(msg) {
  $('#console').append(document.createTextNode(msg+'\n'));
}

// if an image can't be retrieved, 404
// then change to the next image URL if we have one
// lastly change to he default URL
function imageError(field) {
  var f = $(field);
  var next = f.data('next');
  if (next && next.length > 5) {
    f.removeData('next').attr('src', next);
  } else {
    f.removeData('next').removeAttr('onerror').attr('src', DEFAULT_URL);
  }
}

// normalize to canonical domain name
function domainNormalize(domain) {
  if (domain == 'aaa.com' 
   || domain == 'bbb.com' 
   || domain == 'ccc.com') {
    return 'aaa.com';
  }
  return domain;           
}

// given an email address return the domain name
// which is the last 2 parts only
// Ex: foo@a.bar.com will return bar.com
function domainName(addr) {
  if (!addr) {
    return '';
  }
  var parts = addr.toLowerCase().trim().split('@');
  if (parts && parts.length > 1) {
    var dom = parts[parts.length-1];
    var host = dom.split('.');
    if (host && host.length > 1) {
      return domainNormalize(host[host.length-2] + '.' + host[host.length-1]);  
    }
  }
  return '';
}

// if the name is "last, first" -> normalize it "first last"
function cleanName(field) {
  var txt = field.text().trim();
  var comma = txt.indexOf(',');
  if (comma > 0) {
    field.text(txt.substring(comma+1) + ' ' + txt.substring(0, comma));
  }
}

function loadImageForAddress(addr, img) {
  //debug('loadImageForAddress ' + addr);
  
  addr = addr.toLowerCase().trim();

  // special handling if its me
  if (addr.indexOf('me@') == 0
   || addr.indexOf('me2@') == 0) {
    img.attr('src', 'file:///Users/me/Library/Application Support/MailMate/Resources/MmMessagesWebView/me.jpg');
  
  } else if (addr.indexOf('cvs@') == 0) {
    img.attr('src', 'file:///Users/me/Library/Application Support/MailMate/Resources/MmMessagesWebView/cvs.png');
  
  } else if (addr.indexOf('jira@') == 0) {
    img.attr('src', 'file:///Users/me/Library/Application Support/MailMate/Resources/MmMessagesWebView/jira.png');

  } else {
    // gravatar link to show the avatar of that address
    // if not found set to return 404 so onError is triggered
    // so we load the next data attribute with the next image URL to try if gravatar fails
    var gravURL = 'https://www.gravatar.com/avatar/' + md5(addr) + '?s=32&d=404';

    // if gravatar not found, will try to show the icon of the domain via imageError
    var next = domainURL(domainName(addr));      
    img.data('next', next).attr('src', gravURL);
  }
}

// return the image URL for the domain name
function domainURL(domain) {
  if (!domain || domain == null || domain.length < 2) {
    return DEFAULT_URL;

  // custom handling for common domains
  } else if (domain == 'aaa.com') {
    return 'file:///Users/me/Library/Application Support/MailMate/Resources/MmMessagesWebView/aaa.png';

  } else if (domain.indexOf('bbb') >= 0) {
    return 'file:///Users/me/Library/Application Support/MailMate/Resources/MmMessagesWebView/bbb.jpg';

  } else if (domain == 'ccc.com') {
    return 'file:///Users/me/Library/Application Support/MailMate/Resources/MmMessagesWebView/ccc.jpg';

  } else if (domain == 'ddd.com') {
    return 'file:///Users/me/Library/Application Support/MailMate/Resources/MmMessagesWebView/ddd.png';

  } else {
    // use a service to get the site favicon for us
    //next = 'https://icons.duckduckgo.com/ip2/' + domain + '.ico';
    //next = 'https://favicon.yandex.net/favicon/' + domain;
    //next = 'https://www.google.com/s2/favicons?domain=' + domain;
    return 'https://icons.better-idea.org/icon?size=32..64..120&fallback_icon_color=D2C295&url=' + domain;
  }
}


$(document).ready(function() {

  // image for each name field
  $('.h-name').each(function() {
    var n = $(this);
    // clean up the name
    cleanName(n.find('a'));
    // if has a linked image then load it
    var img = null;
    var addr = n.data('addr');
    var imageId = n.data('img');
    if (imageId && imageId.length > 0) {
      img = $('#' + imageId);
    } else {
      img = n.next('img');
    }        
    if (img.length == 1) {
      loadImageForAddress(addr, img);
    }
  });
  
  // image for each displayed address field
  $('.h-addr').each(function() {
    var n = $(this);
    // if displayed then process it
    if (!n.hasClass('h-hide')) {      
      // if has a linked image then load it
      var img = null;
      var addr = n.text();
      var imageId = n.data('img');
      if (imageId && imageId.length > 0) {
        img = $('#' + imageId);
      } else {
        img = n.next('img');
      }        
      if (img.length == 1) {
        loadImageForAddress(addr, img);
      }
    }
  });

  handleRecip('to');
  handleRecip('cc');
  handleRecip('bcc');
});

function handleRecip(recip) {
  // for Recip (To/CC/BCC) label image
  // if just one address then use the image of that address
  // if multiple addresses all of one domain, use the image of that domain
  // else leave default image
  var rs = $('.h-addr-' + recip);
  if (rs.length == 1) {
    loadImageForAddress(rs.first().text(), $('#h-img-' + recip));
    $('.h-' + recip + '-img-sm').addClass('h-hide');
  } else if (rs.length > 1) {
    var dom = null;
    for (var t=0; t < rs.length; t++) {
      var r = $(rs[t]);
      var d = domainURL(domainName(r.text()));
      if (dom != null && dom !== d) {
        dom = null;
        break;
      }
      dom = d;
    }
    if (dom != null) {
      $('#h-img-' + recip).attr('src', dom);
      $('.h-' + recip + '-img-sm').addClass('h-hide');
    }
  }
}

//---------------------------
// http://www.myersdaily.org/joseph/javascript/md5.js

function md5cycle(x, k) {
var a = x[0], b = x[1], c = x[2], d = x[3];

a = ff(a, b, c, d, k[0], 7, -680876936);
d = ff(d, a, b, c, k[1], 12, -389564586);
c = ff(c, d, a, b, k[2], 17,  606105819);
b = ff(b, c, d, a, k[3], 22, -1044525330);
a = ff(a, b, c, d, k[4], 7, -176418897);
d = ff(d, a, b, c, k[5], 12,  1200080426);
c = ff(c, d, a, b, k[6], 17, -1473231341);
b = ff(b, c, d, a, k[7], 22, -45705983);
a = ff(a, b, c, d, k[8], 7,  1770035416);
d = ff(d, a, b, c, k[9], 12, -1958414417);
c = ff(c, d, a, b, k[10], 17, -42063);
b = ff(b, c, d, a, k[11], 22, -1990404162);
a = ff(a, b, c, d, k[12], 7,  1804603682);
d = ff(d, a, b, c, k[13], 12, -40341101);
c = ff(c, d, a, b, k[14], 17, -1502002290);
b = ff(b, c, d, a, k[15], 22,  1236535329);

a = gg(a, b, c, d, k[1], 5, -165796510);
d = gg(d, a, b, c, k[6], 9, -1069501632);
c = gg(c, d, a, b, k[11], 14,  643717713);
b = gg(b, c, d, a, k[0], 20, -373897302);
a = gg(a, b, c, d, k[5], 5, -701558691);
d = gg(d, a, b, c, k[10], 9,  38016083);
c = gg(c, d, a, b, k[15], 14, -660478335);
b = gg(b, c, d, a, k[4], 20, -405537848);
a = gg(a, b, c, d, k[9], 5,  568446438);
d = gg(d, a, b, c, k[14], 9, -1019803690);
c = gg(c, d, a, b, k[3], 14, -187363961);
b = gg(b, c, d, a, k[8], 20,  1163531501);
a = gg(a, b, c, d, k[13], 5, -1444681467);
d = gg(d, a, b, c, k[2], 9, -51403784);
c = gg(c, d, a, b, k[7], 14,  1735328473);
b = gg(b, c, d, a, k[12], 20, -1926607734);

a = hh(a, b, c, d, k[5], 4, -378558);
d = hh(d, a, b, c, k[8], 11, -2022574463);
c = hh(c, d, a, b, k[11], 16,  1839030562);
b = hh(b, c, d, a, k[14], 23, -35309556);
a = hh(a, b, c, d, k[1], 4, -1530992060);
d = hh(d, a, b, c, k[4], 11,  1272893353);
c = hh(c, d, a, b, k[7], 16, -155497632);
b = hh(b, c, d, a, k[10], 23, -1094730640);
a = hh(a, b, c, d, k[13], 4,  681279174);
d = hh(d, a, b, c, k[0], 11, -358537222);
c = hh(c, d, a, b, k[3], 16, -722521979);
b = hh(b, c, d, a, k[6], 23,  76029189);
a = hh(a, b, c, d, k[9], 4, -640364487);
d = hh(d, a, b, c, k[12], 11, -421815835);
c = hh(c, d, a, b, k[15], 16,  530742520);
b = hh(b, c, d, a, k[2], 23, -995338651);

a = ii(a, b, c, d, k[0], 6, -198630844);
d = ii(d, a, b, c, k[7], 10,  1126891415);
c = ii(c, d, a, b, k[14], 15, -1416354905);
b = ii(b, c, d, a, k[5], 21, -57434055);
a = ii(a, b, c, d, k[12], 6,  1700485571);
d = ii(d, a, b, c, k[3], 10, -1894986606);
c = ii(c, d, a, b, k[10], 15, -1051523);
b = ii(b, c, d, a, k[1], 21, -2054922799);
a = ii(a, b, c, d, k[8], 6,  1873313359);
d = ii(d, a, b, c, k[15], 10, -30611744);
c = ii(c, d, a, b, k[6], 15, -1560198380);
b = ii(b, c, d, a, k[13], 21,  1309151649);
a = ii(a, b, c, d, k[4], 6, -145523070);
d = ii(d, a, b, c, k[11], 10, -1120210379);
c = ii(c, d, a, b, k[2], 15,  718787259);
b = ii(b, c, d, a, k[9], 21, -343485551);

x[0] = add32(a, x[0]);
x[1] = add32(b, x[1]);
x[2] = add32(c, x[2]);
x[3] = add32(d, x[3]);

}

function cmn(q, a, b, x, s, t) {
a = add32(add32(a, q), add32(x, t));
return add32((a << s) | (a >>> (32 - s)), b);
}

function ff(a, b, c, d, x, s, t) {
return cmn((b & c) | ((~b) & d), a, b, x, s, t);
}

function gg(a, b, c, d, x, s, t) {
return cmn((b & d) | (c & (~d)), a, b, x, s, t);
}

function hh(a, b, c, d, x, s, t) {
return cmn(b ^ c ^ d, a, b, x, s, t);
}

function ii(a, b, c, d, x, s, t) {
return cmn(c ^ (b | (~d)), a, b, x, s, t);
}

function md51(s) {
txt = '';
var n = s.length,
state = [1732584193, -271733879, -1732584194, 271733878], i;
for (i=64; i<=s.length; i+=64) {
md5cycle(state, md5blk(s.substring(i-64, i)));
}
s = s.substring(i-64);
var tail = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
for (i=0; i<s.length; i++)
tail[i>>2] |= s.charCodeAt(i) << ((i%4) << 3);
tail[i>>2] |= 0x80 << ((i%4) << 3);
if (i > 55) {
md5cycle(state, tail);
for (i=0; i<16; i++) tail[i] = 0;
}
tail[14] = n*8;
md5cycle(state, tail);
return state;
}

/* there needs to be support for Unicode here,
 * unless we pretend that we can redefine the MD-5
 * algorithm for multi-byte characters (perhaps
 * by adding every four 16-bit characters and
 * shortening the sum to 32 bits). Otherwise
 * I suggest performing MD-5 as if every character
 * was two bytes--e.g., 0040 0025 = @%--but then
 * how will an ordinary MD-5 sum be matched?
 * There is no way to standardize text to something
 * like UTF-8 before transformation; speed cost is
 * utterly prohibitive. The JavaScript standard
 * itself needs to look at this: it should start
 * providing access to strings as preformed UTF-8
 * 8-bit unsigned value arrays.
 */
function md5blk(s) { /* I figured global was faster.   */
var md5blks = [], i; /* Andy King said do it this way. */
for (i=0; i<64; i+=4) {
md5blks[i>>2] = s.charCodeAt(i)
+ (s.charCodeAt(i+1) << 8)
+ (s.charCodeAt(i+2) << 16)
+ (s.charCodeAt(i+3) << 24);
}
return md5blks;
}

var hex_chr = '0123456789abcdef'.split('');

function rhex(n)
{
var s='', j=0;
for(; j<4; j++)
s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]
+ hex_chr[(n >> (j * 8)) & 0x0F];
return s;
}

function hex(x) {
for (var i=0; i<x.length; i++)
x[i] = rhex(x[i]);
return x.join('');
}

function md5(s) {
return hex(md51(s));
}

/* this function is much faster,
so if possible we use it. Some IEs
are the only ones I know of that
need the idiotic second function,
generated by an if clause.  */

function add32(a, b) {
return (a + b) & 0xFFFFFFFF;
}
