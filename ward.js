/*
 * Responsible for safely creating a same domain iframe.
 */
(function (root) {
  var ASSET_BASE_ATTR = 'data-ward-assetbase';
  var DEFAULT_ENTRY_POINT = '<%= entryPoint %>';
  var DEFAULT_NAMESPACE = '<%= namespace %>';

  /*
   * Locates the current script tag.
   *
   * @returns {Element} - could be null if the script could not be located.
   *
   */
  function findScriptTag() {
    var scripts = root.document.getElementsByTagName('script');
    var count = scripts.length;
    var script;
    while(count--) {
      script = scripts[count];
      if(script.hasAttribute(ASSET_BASE_ATTR)) {
        return script;
      }
    }
  }

  /*
   * Responsible for rendering a same domain iframe without a server source.
   *
   * @param {Window} global - the global context to use when constructing the
   * iframe
   *
   * @param {String} content - the HTML content for the iframe. Will be
   * rendered into the body of the iframe document
   *
   * @param {Element} rootEle - the reference element to use when rendering the
   * iframe.
   *
   * @param {Function=} frameReady - the function to invoke when the iframe has
   * rendered its content and is ready. This is not the same as
   * jQuery.documentReady!!! It may be called before the document is ready.
   *
   * @param {Function=} preRender - is given the iframe element just prior to
   * being appended to the DOM. Allows you to style as needed.
   *
   */
  function renderIframe(global, content, rootEle, frameReady, preRender) {

    var iframeSource = '<!doctype html><html><head><title></title></head><body>';
    var iframe = global.document.createElement('iframe');
    frameReady = frameReady || function(){};

    function render() {
      var domainSrc;
      var frameDocument;

      rootEle.appendChild(iframe);
      iframe.contentWindow.__ready = frameReady;

      try {
        iframe.contentWindow.document.open();
      } catch(e) {
        domainSrc = 'javascript:var d=document.open();d.domain="' + global.document.domain + '";';
        iframe.src = domainSrc + 'void(0);';
      }

      frameDocument = iframe.contentWindow.document;
      frameDocument.write(iframeSource);
      frameDocument.close();
    }

    iframeSource += content;
    iframeSource += '<script type="text/javascript">window.__ready(window)</script>';
    iframeSource += '</body></html>';

    if(preRender) {
      preRender(iframe, render);
    } else {
      iframe.style.display = 'none';
      iframe.frameBorder = '0';
      setTimeout(render, 1);
    }

    return iframe;
  }

  function platformSupported() {
    /*
     * We dont care about old IE (<9)
     */
    var supported = true;
    var ua;
    var re;
    if (navigator.appName === 'Microsoft Internet Explorer') {
      ua = navigator.userAgent;
      re  = new RegExp('MSIE ([0-8]{1,}[.0-8]{0,})');
      if (re.exec(ua) != null) {
        supported = false;
      }
    }

    return supported;
  }

  /*
   * Gathers all of the data attributes that are marked as ward and constructs
   * the beginning of the application settings object.
   *
   * data-ward-foo = "bar" becomes {foo: "bar"}
   * data-ward-foobar = "baz" becomes {foobar: "baz"}
   *
   *  @param {Element} ele - DOM element to gather settings from
   *  @returns {Object} settings - settings object
   */
  function gatherSettings(ele) {
    var dataPtrn = /^data-ward-/;
    var settings = {};
    var key;

    for (var att, i = 0, atts = ele.attributes, n = atts.length; i < n; i++){
      att = atts[i];
      if(dataPtrn.test(att.nodeName)) {
        key = att.nodeName.replace(dataPtrn, '');
        settings[key] = att.value;
      }
    }

    return settings;
  }

  /*
   *  If our script is placed in the head element the body will not be ready!
   *
   *  @param {Window} global - the window we should use to reference the
   *  document
   *  @param {Function} cb - called when the body is ready
   */
  function waitForBody(global, cb) {
    if(global.document.body) {
      cb();
    } else {
      setTimeout(function () {
        waitForBody(global, cb);
      }, 10);
    }

  }

  /*
   * Boots the main entrypoint script into a hidden same domain iframe.
   *
   * @param {Window} global - the context to use when constructing the iframe.
   *
   * @returns public API
   */
  function bootWard(global) {

    var myScriptTag;
    var settings;
    var content = '';

    if(!platformSupported()) {
      return {err: 'NOT SUPPORTED'};
    }

    myScriptTag = findScriptTag(global);

    if(!myScriptTag) {
      return {err: 'COULD NOT LOCATE SCRIPT TAG'};
    }

    myScriptTag.parentNode.removeChild(myScriptTag);

    settings = gatherSettings(myScriptTag);

    if(!settings.assetbase) {
      return {err: 'NO ASSET BASE CONFIGURED'};
    }

    settings.entrypoint = settings.entrypoint || DEFAULT_ENTRY_POINT;
    settings.namespace = settings.namespace || DEFAULT_NAMESPACE;

    // mark the environment as ours, expose settings, and boot the SDK
    content += '<script type="text/javascript"> window.WARD_FRAME = true;</script>';
    content += '<script type="text/javascript"> window.settings = ' + JSON.stringify(settings) + ';</script>';
    content += '<script type="text/javascript" src="';
    content += settings.assetbase + settings.entrypoint;
    content += '"></script>"';

    waitForBody(global, function () {
      renderIframe(global, content, global.document.body);
    });

    return {};
  }

  if (root.WARD_FRAME && typeof define === 'function' && define.amd) {
    /*
     * If this file is run within our environment it exposes the generic same domain
     * iframe rendering utility
     */
    define(function () {
      return renderIframe;
    });
  } else {
    // expose the public API to the root context
    if(!root[settings.environment]) {
      root[settings.entrypoint] = bootWard(root);
    }
  }

}(this));

