var express = require('express');
var app = express();
app.set('view engine', 'ejs');
app.use('/asset', express.static('public'));

app.get('/', function(request, response) {
    response.render('index', {title:'Matcha'});
});

app.listen(8888);