var crypto = require('crypto'),markdown = require('markdown').markdown, Document;

function defineModels(mongoose, fn) {
	var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

	
	/**
	 * Model: Document
	 */
	Document = new Schema({
		'title' : String,
		'body' : String,
		'date' : { type: Date, default: Date.now }
	});
	
	Document.virtual('id').get(function() {
		return this._id.toHexString();
	});
	
	Document.virtual('body_markdown').get(function() {
		return markdown.toHTML(this.body);
	});
	
	mongoose.model('Document', Document);
	
	fn();
}

exports.defineModels = defineModels;
