#!/bin/env node
var fs = require('fs')
var express = require('express')
var jade = require('jade')
var stylus = require('stylus')
var jadepdf = require('jade-pdf-redline')
var basicAuth = require('basic-auth-connect')
var through = require('through')
var app = express()

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


app.get('/about', function (req, res) {
  res.render('about', { title: 'DBIS | Hadoop Distribution Evaluator - About'})
})

app.get('/matrix_data.json', function (req, res) {
  res.json(require('./predefault_data/matrix.json'))
})

app.post('/submit', function (req, res) {
  var json_filename = Date().toString().replace(/\D/g, '')
  try {
    req.pipe(fs.createWriteStream('./'+json_filename+'.json'))
    req.on('end', function () {
      res.json({info: "success", "link": "/pdf/"+json_filename})
    })
  } catch (e) {
    res.json({info: "error"})
  }
})

app.get('/pdf/:pdfid', function (req, res) {
  fs.createReadStream('./views/pdf.jade')
  .pipe(jadepdf({
    locals: {title: 'DBIS | Hadoop Distribution Evaluator', data: JSON.parse(fs.readFileSync('./'+req.params.pdfid+'.json'))}
  }))
  .pipe(res)
})

app.post('/submit', function (req, res) {
  req.on('end', function () {
    res.json({pdf: "success"})
  })
  
})

var server = app.listen(process.env.OPENSHIFT_NODEJS_PORT || 3001, process.env.OPENSHIFT_NODEJS_IP || '', function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})
