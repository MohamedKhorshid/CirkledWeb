var express = require('express');
var app = express();

require('./routes/users')(app, express);

app.listen('8000');
