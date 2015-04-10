var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

var Q = require('q');
var Item = require('../models/item').Item;
var ItemTypeIcons = require('../models/item').ItemTypeIcons;

var config = require('../config');
var index = require('../routes/index');
var version = require('../helpers/version');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

var staticConfig = config.get();

config.get = function() {
	return staticConfig;
}

describe('routes.index', function() {
	var items = [{ type : 'movie' }];
	var res = {
		render : sinon.spy()
	};
	
	before(function () {
		config.get().version = 1;
		Item.find = function() {
			return Q(items);
		};
		version.myVersion = 'My version';
		version.newVersion = sinon.stub().returns(Q('Some new version'));
	});
		
	it('should successfully get index', function() {
		return index.index(undefined, res).should.be.fulfilled.then(function() {
			return res.render.should.have.been.calledWith('index', {
				title : 'lumus',
				myVersion : 'My version',
				newVersion : 'Some new version',
				items : items,
				icons : ItemTypeIcons
			});
		});
	});
});