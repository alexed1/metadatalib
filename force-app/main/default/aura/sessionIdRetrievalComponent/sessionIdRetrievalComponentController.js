({
    doInit: function (component) {
        var currentUrl = window.location.href;
        //for example
        //https://myinstance-dev-ed.lightning.force.com/one/one.app#/n/namespace__ComponentName
        var splitedUrl = currentUrl.split('/');
        var lastPart = splitedUrl.pop();

        var prefixSeparatorIndex = lastPart.lastIndexOf('__');
        var organizationPrefix = '';

        if (prefixSeparatorIndex > 0) {
            organizationPrefix = lastPart.substr(0, prefixSeparatorIndex) + '__';
        }

        var url = '/apex/' + organizationPrefix + 'sessionIdRetrievalVFPage?parentUrl=' + currentUrl;
        component.set('v.callerURL', url);
        var listenerFunction = function (event) {
            //xss vulnerability?
            var sessionId = event.data.sessionId;
            if (sessionId) {
                component.set('v.showVFPage', false);
                component.set('v.sessionId', sessionId);
                window.removeEventListener("message", listenerFunction);
            }
        };
        window.addEventListener("message", listenerFunction, true);
    },
})
