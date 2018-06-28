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

    getMetadataItemsAsync: function (cmp, event, helper) {
        var args = event.getParam('arguments');
        var loadSessionPromise = helper.ensureSessionIdIsRetrievedAsync(cmp);
        var result = new Promise(function (resolve, reject) {
            loadSessionPromise.then(function (sessionId) {
                var callback = $A.getCallback(function () {
                    var action = cmp.get('c.getMetadataItems');
                    action.setParams({
                        sessionId: sessionId,
                        type: args.type
                    });
                    action.setCallback(this, function (response) {
                        var callback = $A.getCallback(function () {
                            var state = response.getState();
                            if (state === 'SUCCESS') {
                                var result = response.getReturnValue();
                                if (result.success) {
                                    resolve(result.results);
                                } else {
                                    reject(result.error);
                                }
                            } else {
                                reject(response.getError());
                            }
                        });
                        callback();

                    });
                    $A.enqueueAction(action);
                });
                callback();
            });
        });
        return result;
    }
})