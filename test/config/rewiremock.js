var rewiremock = require('rewiremock/webpack');
rewiremock.overrideEntryPoint(module); // this is important
window.rewiremock = rewiremock;