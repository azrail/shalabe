var app = require('express').createServer();

app.get('/', function(req, res){
  res.send('hello world');
});

app.get('/user/:id', function(req, res){
    res.send('user ' + req.params.id);
});


app.listen(3000);

console.log('Server running at http://127.0.0.1:3000/');