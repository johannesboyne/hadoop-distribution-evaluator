var fs = require('fs')
var express = require('express')
var jade = require('jade')
var stylus = require('stylus')
var app = express()
var basicAuth = require('basic-auth-connect')

app.set('view engine', 'jade');

app.use(stylus.middleware({
  src: __dirname + '/resources',
  dest: __dirname + '/public',
  debug: true,
  force: true
}))
var options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html', 'css', 'js', 'png', 'jpg', 'json'],
  index: false,
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now())
  }
}
app.use(express.static('public', options))
app.use(express.static('bower_components', options))
app.use(express.static('predefault_data', options))
app.use(basicAuth('username', 'password'))

app.get('/', function (req, res) {
  res.render('index', { title: 'DBIS | Hadoop Distribution Evaluator', message: 'Hello there!', data: require('./predefault_data/matrix.json')})
})

app.get('/matrix_data.json', function (req, res) {
  res.json(require('./predefault_data/matrix.json'))
})

app.post('/submit', function (req, res) {
  try {
    req.pipe(fs.createWriteStream('./'+Date().toString().replace(/\D/g, '')+'.json'))
    req.on('end', function () {
      res.json({info: "success"})
    })
  } catch (e) {
    res.json({info: "error"})
  }
})

var server = app.listen(3001, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})
