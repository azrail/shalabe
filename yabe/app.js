var express = require('express@2.0.0beta3'), connect = require('connect@1.0.6'), jade = require('jade@0.8.6'), app = module.exports = express
		.createServer(), mongoose = require('mongoose@1.1.4'), mongoStore = require('connect-mongodb@0.2.1'), mailer = require('mailer@0.4.52'), stylus = require('stylus@0.7.4'), markdown = require('markdown').markdown, sys = require('sys'), path = require('path'), models = require('./models'), db, Document, User, LoginToken, Settings = {
	development : {},
	test : {},
	production : {}
};

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
	res.render('index.jade', {
		title : 'Express'
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

// Only listen on $ node app.js

if (!module.parent) {
	app.listen(3001);
	console.log("Express server listening on port %d", app.address().port);
}
