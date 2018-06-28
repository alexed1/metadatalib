({  
    ensureSessionIdIsRetrievedAsync: function (cmp) {
        var self = this;
        var result = new Promise(function (resolve) {
            var sessionId = cmp.get('v.sessionId');
            if (sessionId) {
                resolve(sessionId);
            } else {
                window.setTimeout($A.getCallback(function () {
                    self.ensureSessionIdIsRetrievedAsync(cmp).then(function (success) { 
                        resolve(success);
                    })
                }), 250);
            }
        });
        return result;
    },    
})