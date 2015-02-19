(function (root, factory) {
    'use strict';
    /*global module*/
    if (typeof define === 'function' && define.amd) {
        define([], factory); //AMD
    } else if (typeof module === 'object') {
        module.exports = factory(); //Node
    } else {
        root.bi = factory(); //Browser
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

    /**
     * Properly join to parts of a URL into one
     * @param {string} base
     * @param {string} extra
     * @returns {string}
     */
    function joinURL(base, extra) {
        return base.replace(/\/$/, '') + '/' + extra.replace(/^\//, '');
    }

    /**
     * Register collection of events or errors
     * @param {object} descs - JSON or array of events/errors descriptors
     */
    function register(descs) {
        if (Array.isArray(descs)) {
            descs.forEach(this);
        } else {
            register.call(this, Object.keys(descs).map(function (key) { return descs[key]; }));
        }
    }

    /**
     * Validate the proper structure of event/error fields
     * @param {object} desc - event/error description. Optional fields property details expected
     * @param {object} fields - data fieilds to be validated
     * @returns {boolean} - true is validated, false otherwise
     */
    function validateFields(desc, fields) {
        if (!desc.fields) {
            return true;
        }
        return Object.keys(fields).every(function (field) {
            return typeof fields[field] === desc.fields[field];
        });
    }

    /**
     * Create and initialize bi context
     * @param {string} base - base URL of the BI service
     * @param {object} [options] - configuration flags: disabled, log, eventsEndpoint, errorsEndpoint
     */
    return function init(base, options) {
        options = options || {};

        function send(url, fields, exclude) {
            exclude = exclude || {};

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

            url = Object.keys(fields).reduce(function (result, field) {
                return field in exclude ? result : result + '&' + field + '=' + encode(fields[field]);
            }, url);

            if (!options.disabled) {
                var img = new Image();
                img.src = url;
            }
            if (options.log) {
                console.log('BI:', url);
            }
        }

        var events = {};

        /**
         * Generate a unique has value for an event descriptor. Also usable as part of event URL
         * @param {object} desc - event descriptor
         * @returns {string} - event hash value
         */
        function hashEvent(desc) {
            var endpoint = desc.endpoint || options.eventsEndpoint || '';
            return endpoint + '?evid=' + desc.evid;
        }

        /**
         *
         * @param {object} desc - event descriptor
         * @returns {boolean} - event descriptor exists, and has required fields (evid and p
         */
        function validateEventDesc(desc) {
            return desc && desc.evid && (desc.endpoint || options.eventsEndpoint);
        }

        function registerEvents() {
            function registerEvent(desc) {
                if (!validateEventDesc(desc, options.eventsEndpoint)) {
                    throw new BIError('Invalid event structure', desc);
                }
                var id = hashEvent(desc);
                if (events[id] && events[id] !== desc) {
                    throw new BIError('Event already registered', events[id]);
                }
                events[id] = desc;
            }
            register.apply(registerEvent, arguments);
        }

        function validateEventRegistration(desc) {
            return options.noRegistration || events[hashEvent(desc)] === desc;
        }

        function sendEvent(desc, fields) {
            var url = joinURL(base, hashEvent(desc));
            send(url, fields);
        }

        function event(desc, fields) {
            fields = fields || {};

            if (!validateEventDesc(desc)) {
                throw new BIError('Invalid event structure', desc);
            }

            if (!validateEventRegistration(desc)) {
                throw new BIError('Event not registered', desc);
            }

            if (!validateFields(desc, fields)) {
                throw new BIError('Event field validation failed', desc);
            }

            sendEvent(desc, fields);
        }

        var errors = {};

        function hashError(desc) {
            var endpoint = desc.endpoint || options.errorsEndpoint || '';
            return endpoint + '?errc=' + desc.errc;
        }

        function validateErrorDesc(desc) {
            return desc && desc.errc && (desc.endpoint || options.errorsEndpoint);
        }

        function registerErrors() {
            function registerError(desc) {
                if (!validateErrorDesc(desc, options.eventsEndpoint)) {
                    throw new BIError('Invalid event structure', desc);
                }
                var id = hashError(desc);
                if (errors[id] && errors[id] !== desc) {
                    throw new BIError('Event already registered', errors[id]);
                }
                errors[id] = desc;
            }
            register.apply(registerError, arguments);
        }

        function validateErrorRegistration(desc) {
            return options.noRegistration || errors[hashError(desc)] === desc;
        }

        function sendError(desc, fields, severity) {
            var url = joinURL(base, hashError(desc));
            url += '&sev=' + severity;
            send(url, fields, {sev: true});
        }

        var errorSeverities = {
            recoverable: 10,
            warning: 20,
            error: 30,
            fatal: 40
        };

        function error(desc, fields) {
            fields = fields || {};

            if (!validateErrorDesc(desc)) {
                throw new BIError('Invalid error structure', desc);
            }

            if (!validateErrorRegistration(desc)) {
                throw new BIError('Error not registered', desc);
            }

            if (!validateFields(desc, fields)) {
                throw new BIError('Error field validation failed', desc);
            }

            var severity = desc.sev || fields.sev || 30;
            if (typeof severity === 'string') {
                severity = errorSeverities[severity] || 30;
            }

            sendError(desc, fields, severity);
        }

        return {
            registerEvents: registerEvents,
            event: event,
            registerErrors: registerErrors,
            error: error
        };
    };
}));
