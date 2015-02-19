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

* **disabled** - Boolean: If *true* then BI messages are created, but not actually sent to the BI service. Default is *false*.
* **log** - Boolean: If *true* then BI messages are written to the console log. Default is *false*.
* **eventsEndpoint** - string: specifies default endpoint for events. If specified, event descriptors will be considered valid
even if they don't contain an *endpoint* field.
* **errorsEndpoint** - string: specifies default endpoint for errors. If specified, error descriptors will be considered valid
even if they don't contain an *endpoint* field.

### Event / error descriptor
Event and error descriptors are objects that specify the structure of events or error messages.

* **Event descriptors** have the following fields:
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

### registerEvents
All events **must** be registered before they can be used. Invoke *registerEvents* passing in an object containing event
definitions as a JSON, or an array of event definitions.