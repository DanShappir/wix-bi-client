# Wix Client BI API
An API for sending events and reporting errors using the Wix BI mechanism.

This API can be included in a project using [RequireJS](http://requirejs.org/), [CommonJS](http://www.commonjs.org/), or via a &lt;script&gt; tag.

## Usage Example
```html
<script src="bower_components/wix-bix-client/dist/bi.min.js"></script>
<script>
    var bix = bi('http://frog.wix.com');
    var events = {
        NOTIFY_START: {
            endpoint: 'bi',
            evid: 10
        }
    };
    bix.registerEvents(events);
    bix.event(events.NOTIFY_START, {data: 'hello'}); // http://frog.wix.com/bi?evid=10&data=hello
</script>
```

## Installation
Simply use [Bower](http://bower.io/):

1. Install Bower: *npm install -g bower*
2. Configure Bower to use the [Wix Bower Registry](http://kb.wixpress.com/display/dashboard/Creating+a+bower+component)
2. Install the package: *bower install wix-bi-client*

The minified API implementation will now be installed in *bower_components/wix-bix-client/dist/bi.min.js*.
The debug version will be located in *bower_components/wix-bix-client/src/bi.js*.

## API

### Initialization
You must first instantiate the BI library by invoking the *bi* function, passing in the base-URL of the BI service,
and optionally a configuration object. This function returns an object containing four functions: *registerEvents*,
*event*, *registerErrors*, and *error*. The *bi* function can be invoked multiple times, each invocation creating a
distinct BI environment.

```javascript
require(['bower_components/wix-bix-client/dist/bi.min'], function (bi) {
    var bix = bi('http://frog.wix.com');
    var events = {
        NOTIFY_START: {
            endpoint: 'bi',
            evid: 10
        }
    };
    bix.registerEvents(events);
    bix.event(events.NOTIFY_START, {data: 'hello'}); // http://frog.wix.com/bi?evid=10&data=hello
});
```

In addition to the base URL, an optional configuration object can be passed to the *bi* initialization function.
This object can have the following fields:

* **disabled** - Boolean: if *true* then BI messages are created, but not actually sent to the BI service. Default is *false*.
* **log** - Boolean: if *true* then BI messages are written to the console log. Default is *false*.
* **eventsEndpoint** - string: specifies default endpoint for events. If specified, event descriptors will be considered valid
even if they don't contain an *endpoint* field.
* **errorsEndpoint** - string: specifies default endpoint for errors. If specified, error descriptors will be considered valid
even if they don't contain an *endpoint* field.
* **noCacheBuster - Boolean: if *true* prevents a cache buster from being appended to the URL. Default is *false*.
* **noRegistration** - Boolean: if *true* both events and errors do not need to be registered prior to being used.
Default is *false*.

### Event / error descriptor
Event and error descriptors are objects that specify the structure of events or error messages.

**Event descriptors** have the following fields:
* *endpoint* - string: the target for the BI events
* *evid* - number: the numeric id of the specified event
* *fields* - object: optional specification of allowed field and types. Only fields that appear in the specification are allowed.

```javascript
var events = {
    NOTIFY_START: {
        endpoint: 'bi',
        evid: 10,
        fields: {
            name: 'string',
            age: 'number'
        }
    }
};
bix.registerEvents(events);
```

**Error descriptors** have the following fields:
* *endpoint* - string: the target for the BI events
* *errc* - number: the numeric id of the specified error
* *fields* - object: optional specification of allowed field and types. Only fields that appear in the specification are allowed.

### registerEvents
All events **must** be registered before they can be used. Invoke *registerEvents* passing in an object containing event
definitions as a JSON, or an array of event definitions. *registerEvents* can be invoked multiple times, with a cumulative affect.

Registered event descriptors **must** be valid in order to be registered, otherwise a BIError will be thrown.
An event descriptor is valid if:
1. It's a valid JavaScript object
2. It has an *evid* field
3. It either has an *endpoint* field, or *eventsEndpoint* is defined on *options*
4. The combination of *evid* and the endpoint is unique

### event
Send an event, previously registered using *registerEvents*. **event** accepts two parameters:
1. A reference to the registered event descriptor
2. An optional object specifying field values
If a field object is specified it must be valid: if the event descriptor has a *field* specification,
the types of the *fields* must match the specification.


```javascript
var events = {
    NOTIFY_START: {
        endpoint: 'bi',
        evid: 10,
        fields: {
            name: 'string',
            age: 'number'
        }
    }
};
bix.registerEvents(events);
bix.event(events.NOTIFY_START, {
    name: 'Jim' // name is a string
});
```

### registerErrors
All errors **must** be registered before they can be used. Invoke *registerErrors* passing in an object containing error
definitions as a JSON, or an array of error definitions. *registerErrors* can be invoked multiple times, with a cumulative affect.

Registered error descriptors **must** be valid in order to be registered, otherwise a BIError will be thrown.
An error descriptor is valid if:
1. It's a valid JavaScript object
2. It has an *errc* field
3. It either has an *endpoint* field, or *errorsEndpoint* is defined on *options*
4. The combination of *errc* and the endpoint is unique

## error
Send an event, previously registered using *registerEvents*. **event** accepts two parameters:
1. A reference to the registered event descriptor
2. An optional object specifying field values
If a field object is specified it must be valid: if the event descriptor has a *field* specification,
the types of the *fields* must match the specification.


```javascript
var errors = {
    FAILED_INIT: {
        endpoint: 'trg',
        errc: 10,
        fields: {
            kind: 'number'
        }
    }
};
bix.registerErrors(errors);
bix.error(errors.FAILED_INIT, {
    kind: 42 // kind is a number
});
```
