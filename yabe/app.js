var express = require('express@2.0.0beta3'), connect = require('connect@1.0.6'), jade = require('jade@0.8.6'), app = module.exports = express
		.createServer(), mongoose = require('mongoose@1.1.4'), mongoStore = require('connect-mongodb@0.2.1'), mailer = require('mailer@0.4.52'), stylus = require('stylus@0.7.4'), markdown = require('markdown').markdown, sys = require('sys'), path = require('path'), models = require('./models'), db, Document, User, LoginToken, Settings = {
	development : {},
	test : {},
	production : {}
};

/**
 * Neustarten des Node Servers wenn sich dateien geändert haben
 */
var autoexit_watch=require('./autoexit.js').watch;
autoexit_watch(__dirname,".js");
autoexit_watch(__dirname+"/views",".jade");
autoexit_watch(__dirname+"/views/artikel",".jade");

app.helpers(require('./helpers.js').helpers);
app.dynamicHelpers(require('./helpers.js').dynamicHelpers);

app.configure('development', function() {
	app.set('db-uri', 'mongodb://127.0.0.1/dev');
	app.use(express.errorHandler({
		dumpExceptions : true
	}));
});

app.configure('test', function() {
	app.set('db-uri', 'mongodb://127.0.0.1/yabe-test');
});

app.configure('production', function() {
	app.set('db-uri', 'mongodb://127.0.0.1/yabe-production');
});

app.configure(function() {
	app.set('views', __dirname + '/views');
	app.use(express.favicon());
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({
		store : mongoStore(app.set('db-uri')),
		secret : 'topsecret'
	}));
	app.use(express.logger({
		format : '\x1b[1m:method\x1b[0m \x1b[33m:url\x1b[0m :response-time ms'
	}));
	app.use(express.methodOverride());
	app.use(stylus.middleware({
		src : __dirname + '/public'
	}));
	app.use(express.static(__dirname + '/public'));
});

models.defineModels(mongoose, function() {
	app.Document = Document = mongoose.model('Document');
	db = mongoose.connect(app.set('db-uri'));
});

// Routes
app.get('/', function(req, res) {
	Document.find({}, [], {
		sort : [
			[
					'date', -1
			]
		]
	}, function(err, documents) {
		sys.debug(documents);
		switch (req.params.format) {
			case 'json':
				res.send(documents.map(function(d) {
					return d.toObject();
				}));
				break;
			default:
				res.render('index.jade', {
					title : 'yab.',
					locals : {
						documents : documents
					}
				});
		}
	});
});

// Create document
app.post('/artikel/new.:format?', function(req, res) {
	sys.debug("/artikel/new");
	sys.debug(req.body.artikel.body);
	var d = new Document(req.body.artikel);
	sys.debug(app.set('db-uri'));
	sys.debug('Document created?');
	d.save(function() {
		sys.debug('Document created!');
		switch (req.params.format) {
			case 'json':
				req.flash('info', 'Document created!');
				res.send(d.toObject());
				break;
			default:
				sys.debug('Document created');
				req.flash('info', 'Document created!');
				res.redirect('/');
		}
	});
});

// Delete document
app.get('/artikel/delete/:id?', function(req, res) {
	sys.debug("Lösche: " + req.params.id);
	Document.findOne({
		_id : req.params.id
	}, function(err, d) {
		if (!d)
			return next(new NotFound('Document not found'));
		d.remove(function() {
			req.flash('info', 'Document deleted');
			res.redirect('/');
		});
	});
});

// Update document
app.post('/artikel/update/:id?', function(req, res) {
	sys.debug("Update: " + req.params.id);
	Document.findOne({
		_id : req.params.id
	}, function(err, d) {
		d.title = req.body.artikel.title;
		d.body = req.body.artikel.body;
		if (!d)
			return next(new NotFound('Document not found'));
		d.save(function() {
			req.flash('info', 'Document updated');
			res.redirect('/');
		});
	});
});

// Edit document
app.get('/artikel/edit/:id?', function(req, res) {
	sys.debug("Editiere: " + req.params.id);
	Document.findOne({
		_id : req.params.id
	}, function(err, d) {
		if (!d)
			return next(new NotFound('Document not found'));
		
		res.render('artikel/edit.jade', {
			title : 'yab.',
			locals : {
				document : d
			}
		});
	});
});

// Only listen on $ node app.js
if (!module.parent) {
	app.listen(3001);
	console.log("Express server listening on port %d", app.address().port);
}
