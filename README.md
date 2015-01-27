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
