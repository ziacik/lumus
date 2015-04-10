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
var itemRoutes = require('../routes/item');
var torrenter = require('../jobs/torrenter');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

var staticConfig = config.get();

config.get = function() {
	return staticConfig;
}

describe('routes.item', function() {
	var item;
	var res;
	
	beforeEach(function () {
		item =  { type : 'movie' };
		Item.setupMethods(item);
		item.save = sinon.spy(item.save);
		item.planNextCheck = sinon.spy(item.planNextCheck);
		Item.findById = function(id) {
			return id === 123 ? Q(item) : Q(undefined);
		};
		Item.save = sinon.stub().returns(Q(this));
		Item.removeById = sinon.stub().returns(Q(undefined));
		torrenter.removeTorrent = sinon.stub().returns(Q(undefined));
		res = {
			render : sinon.spy(),
			redirect : sinon.spy()
		};
		util.error = sinon.spy();
	});
		
	it('should add item', function() {
		return itemRoutes.add({query : { name : 'Test', type : 'movie', year : 2015, externalId : 'tt000000' } }, res).should.be.fulfilled.then(function() {
			return Item.save.should.have.been.calledWithMatch({ name : 'Test', state : ItemStates.wanted });
		}).then(function() {
			return res.redirect.should.have.been.calledWith('/');
		});
	});
		
	it('should change item', function() {
		return itemRoutes.changeState({query : { id : 123, state : ItemStates.downloaded } }, res).should.be.fulfilled.then(function() {
			return item.planNextCheck.should.have.been.called;
		}).then(function() {
			return Item.save.should.have.been.calledWithMatch({ state : ItemStates.downloaded });
		}).then(function() {
			return res.redirect.should.have.been.calledWith('/');
		});
	});
		
	it('should remove item', function() {
		return itemRoutes.remove({query : {id : 123} }, res).should.be.fulfilled.then(function() {
			return Item.removeById.should.have.been.calledWith(123);
		}).then(function() {
			return torrenter.removeTorrent.should.have.been.calledWith(item, true);
		}).then(function() {
			return res.redirect.should.have.been.calledWith('/');
		});
	});
		
	it('should not fail from invalid item', function() {
		return itemRoutes.remove({query : {id : 0} }, res).should.be.fulfilled.then(function() {
			return Item.removeById.should.not.have.been.called;
		}).then(function() {
			return torrenter.removeTorrent.should.not.have.been.called;
		}).then(function() {
			return util.error.should.not.have.been.called;
		}).then(function() {
			return res.redirect.should.have.been.calledWith('/');
		});
	});
		
	it('should not fail from torrent removal inability', function() {
		torrenter.removeTorrent = function() { return Q.fcall(function() { throw new Error('Unable to connect'); }); };
		
		return itemRoutes.remove({query : {id : 123} }, res).should.be.fulfilled.then(function() {
			return Item.removeById.should.have.been.calledWith(123);
		}).then(function() {
			return util.error.should.have.been.called;
		}).then(function() {
			return res.redirect.should.have.been.calledWith('/');
		});
	});
});