# WardJS Thirdparty JS isolation container

When building a thirdparty JavaScript application isolation your JavaScript
from the host page can be a difficult task. Ward sets up a hidden same domain 
iframe and loads your application. Since your script is running within the 
context of a same domain iframe you have complete access to the host page's
DOM through `window.top`. 

Using jquery and need access to the host page? Now problem just scope your 
queries using the host page's document `$('.button', window.top.document)`;

You can also use load this script within your same domain iframe and it will 
expose a utility function which can be used to create additional same domain
iframes!

Your isolation iframe is hidden and is used mostly as a script isolation container. 
But you can use the iframe element to host UI which is isolated from the host
page's CSS styles. This is a perfect canvas for a modal dialog!

# Configuration

All data attributes prefixed with `data-ward-` will be exposed within your iframe
in the global `settings` object. Some of the attributes can be used to override 
your iframe loading behavior. 

* `data-ward-assetbase` - the base directory of your entrypoint file.
* `data-ward-namespace` - the global namespace to expose on the host page. 
* `data-ward-entrypoint` - the script tag that is loaded into the iframe.

# AMD Module

If the ward is loaded within the iframe and there is an AMD loader present it will
register a utility function which can be used to create additional iframes. 

```javascript
renderIframe(global, content, rootEle, frameReady, preRender);
```

* `global` - the global object to use when rendering the iframe
* `content` - HTML content to render into the iframe
* `rootEle` - Root HTML element to append to when rendering
* `frameReady` - callback which notifies you when iframe is ready.
* `preRender` - a function which can be used to control the rendering of the frame.


```javascript
preRender(iframe, render);
```

* `iframe` - the iframe element
* `render` - a function when invoked will complete the iframe rendering process


