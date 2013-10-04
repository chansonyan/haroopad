var defaults = {
  "gfm": true,
  "tables": true,
  "breaks": false,
  "pedantic": false,
  "sanitize": false,
  "smartLists": true,
  "smartypants": true,
  "silent": false,
  "highlight": null,
  "langPrefix": ''
};

var lexer = new marked.Lexer(defaults);

var customRules = {
    // plugin: /^ *\[([^\:\]]+):([^\]]+)\] *\n*/,
    oembed: /^@\[(inside)\]\(href\)/
    // plugin: /^ *\[([^\:\]]+):([^\]\/]+)\][^\(] */
}

var _inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
var _href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

customRules.oembed = replace(customRules.oembed)
  ('inside', _inside)
  ('href', _href)
  ();

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}

lexer.rules = merge({}, lexer.rules, customRules);


var renderer = new marked.Renderer();
renderer.image = function(cap, href, props) {
      var key, value, tmp = {};
      var imgPattern = /[^\s]+(\.(jpg|png|gif|bmp|jpeg))$/i;

      if (!href) {
        return '';
      }

      if (imgPattern.test(href)) {
        return '<img src="'
            + href
            + '" alt="'
            + escape(cap[1])
            + '"'
            + (props
            ? ' title="'
            + escape(props)
            + '"'
            : '')
            + '>';
      }

      props = !props ? '' : props ;

      if (props) {
        props = props.split(',');
        props.forEach(function(prop) {
          prop = prop.split(':');
          tmp[prop[0]] = prop[1];
        });
        props = JSON.stringify(tmp);
        props = encodeURIComponent(props);
      }
      return '<p href="'+ href +'" data-origin="'+ href +'#'+ props +'" data-props="'+ props +'" class="oembed"></p>';
    }

var Lexer = lexer;
var Renderer = renderer;
var parse = function(src, options) {
  if (options) {
    Lexer.options = options;
  }
  var tokens = Lexer.lex(src);
  return marked.parser(tokens, Lexer.options, Renderer);
}