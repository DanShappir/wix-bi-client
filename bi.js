(function (root, factory) {
    'use strict';
    /*global module*/
    if (typeof define === 'function' && define.amd) {
        define([], factory); //AMD
    } else if (typeof module === 'object') {
        module.exports = factory(); //Node
    } else {
        root.BI = factory(); //Browser
    }
}(this, function () {
    'use strict';

    function BIError(message, desc) {
        this.name = 'BIError';
        this.message = message;
        this.desc = desc;
    }
    BIError.prototype = Object.create(Error.prototype);
    BIError.prototype.constructor = BIError;

    function joinURL(base, extra) {
        return base.replace(/\/$/, '') + '/' + extra.replace(/^\//, '');
    }

    return function init(base, eventDescs, errorDescs) {
        function validateDesc(desc, descs) {
            return desc || descs || true;
        }

        function validateParams(desc, params) {
            return desc || params || true;
        }

        function encode(value) {
            switch (typeof value) {
                case 'boolean':
                    value = value ? 1 : 0;
                // falls through

                case 'number':
                    return '' + value;

                case 'object':
                    value = JSON.stringify(value);
                // falls through

                case 'string':
                    return encodeURIComponent(value);
            }
        }

        function send(url) {
            var img = new Image();
            img.src = url;
        }

        function event(desc, params) {
            if (!validateDesc(desc, eventDescs)) {
                throw new BIError('Undefined event', desc);
            }

            if (!validateParams(desc, params)) {
                throw new BIError('', desc);
            }

            var url = joinURL(base, desc.adapter);
            url = Object.keys(params).reduce(function (result, param) {
                return result + '&' + param + '=' + encode(params[param]);
            }, url + '&&&');
            send(url.replace(/&&&&/, '?'));
        }

        function error(desc, params) {
            return desc || params || errorDescs;
        }

        return {
            event: event,
            error: error
        };
    };
}));
