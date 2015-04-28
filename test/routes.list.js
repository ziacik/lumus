var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var sinon = require('sinon');
var sinonChai = require("sinon-chai");
var util = require('util');

var Q = require('q');
var Item = require('../models/item').Item;
var ItemStates = require('../models/item').ItemStates;
var ItemTypeIcons = require('../models/item').ItemTypeIcons;

var config = require('../config');
var listRoutes = require('../routes/list');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

var staticConfig = config.get();

config.get = function() {
	return staticConfig;
}

describe('routes.list', function() {
	var item;
	var res;
	
	beforeEach(function () {
		item =  { type : 'movie' };
		Item.setupMethods(item);
		item.save = sinon.spy(item.save);
		item.planNextCheck = sinon.spy(item.planNextCheck);
		Item.find = function(condition, sort) {
			return Object.getOwnPropertyNames(condition).length === 0 ? Q([item]) : Q([]);
		};
		Item.save = sinon.stub().returns(Q(this));
		res = {
			render : sinon.spy(),
			redirect : sinon.spy()
		};
		util.error = sinon.spy();
	});
		
	it('should add item', function() {
		return listRoutes.add({query : { name : 'Test', type : 'movie', year : 2015, externalId : 'tt000000' } }, res).should.be.fulfilled.then(function() {
			return Item.save.should.have.been.calledWithMatch({ name : 'Test', state : ItemStates.wanted });
		}).then(function() {
			return res.redirect.should.have.been.calledWith('/');
		});
	});
		
	it('should list items', function() {
		return listRoutes.list({}, res).should.be.fulfilled.then(function() {
			return res.render.should.have.been.calledWith('list', {
				items : [ item ],
				icons : require('../models/item').ItemTypeIcons
			});
		});
	});
});