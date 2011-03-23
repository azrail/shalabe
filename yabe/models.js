var crypto = require('crypto'), Document;

function defineModels(mongoose, fn) {
	var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;
	
	/**
	 * Model: Document
	 */
	Document = new Schema({
		'title' : String,
		'body' : String
	});
	
	Document.virtual('id').get(function() {
		return this._id.toHexString();
	});
	
	mongoose.model('Document', Document);
	
	fn();
}

exports.defineModels = defineModels;
