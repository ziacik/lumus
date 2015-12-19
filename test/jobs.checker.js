var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

var Q = require('q');
var Item = require('../models/item').Item;
var ItemStates = require('../models/item').ItemStates;

var config = require('../config');
var checker = require('../jobs/checker');
var subtitler = require('../jobs/subtitler');
var searcher = require('../jobs/searcher');
var torrenter = require('../jobs/torrenter');
var renamer = require('../jobs/renamer');
var notifier = require('../jobs/notifier');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

subtitler.hasSubtitlesForName = function() {
	return Q(true);
}

var staticConfig = config.get();

config.get = function() {
	return staticConfig;
}

describe('checker', function() {
	var clock;
	
	beforeEach(function () {
		config.get().removeFinishedDays = 0;
		clock = sinon.useFakeTimers();
	});
	
	afterEach(function () {
		clock.restore();
	});
	
	it('should search for wanted movie', function() {
		searcher.findAndAdd = sinon.spy();
		Item.find = function() {
			return Q([{ type : 'movie', state : ItemStates.wanted }]);
		};
		return checker().should.be.fulfilled.then(function() {
			return searcher.findAndAdd.should.have.been.called;
		});
	});

	it('should search for wanted show', function() {
		searcher.findAndAdd = sinon.spy();
		Item.find = function() {
			return Q([{ type : 'show', state : ItemStates.wanted }]);
		};
		return checker().should.be.fulfilled.then(function() {
			return searcher.findAndAdd.should.have.been.called;
		});
	});

	it('should search for wanted music', function() {
		searcher.findAndAdd = sinon.spy();
		Item.find = function() {
			return Q([{ type : 'music', state : ItemStates.wanted }]);
		};
		return checker().should.be.fulfilled.then(function() {
			return searcher.findAndAdd.should.have.been.called;
		});
	});
	
	it('should check if torrent finished for snatched movie', function() {
		torrenter.checkFinished = sinon.spy();
		var item = { type : 'movie', state : ItemStates.snatched };
		Item.find = function() {
			return Q([item]);
		};
		return checker().should.be.fulfilled.then(function() {
			return torrenter.checkFinished.should.have.been.calledWith(item);
		});
	});

	it('should check if torrent finished for snatched show', function() {
		torrenter.checkFinished = sinon.spy();
		var item = { type : 'show', state : ItemStates.snatched };
		Item.find = function() {
			return Q([item]);
		};
		return checker().should.be.fulfilled.then(function() {
			return torrenter.checkFinished.should.have.been.calledWith(item);
		});
	});

	it('should check if torrent finished for snatched music', function() {
		torrenter.checkFinished = sinon.spy();
		var item = { type : 'music', state : ItemStates.snatched };
		Item.find = function() {
			return Q([item]);
		};
		return checker().should.be.fulfilled.then(function() {
			return torrenter.checkFinished.should.have.been.calledWith(item);
		});
	});

	it('should rename downloaded movie', function() {
		renamer.rename = sinon.spy();
		var item = { type : 'movie', state : ItemStates.downloaded };
		Item.find = function() {
			return Q([item]);
		};
		return checker().should.be.fulfilled.then(function() {
			return renamer.rename.should.have.been.calledWith(item);
		});
	});

	it('should rename downloaded show', function() {
		renamer.rename = sinon.spy();
		var item = { type : 'show', state : ItemStates.downloaded };
		Item.find = function() {
			return Q([item]);
		};
		return checker().should.be.fulfilled.then(function() {
			return renamer.rename.should.have.been.calledWith(item);
		});
	});

	it('should rename downloaded music', function() {
		renamer.rename = sinon.spy();
		var item = { type : 'music', state : ItemStates.downloaded };
		Item.find = function() {
			return Q([item]);
		};
		return checker().should.be.fulfilled.then(function() {
			return renamer.rename.should.have.been.calledWith(item);
		});
	});

	it('should update library for renamed movie', function() {
		notifier.updateLibrary = sinon.spy();
		var item = { type : 'movie', state : ItemStates.renamed };
		Item.find = function() {
			return Q([item]);
		};
		return checker().should.be.fulfilled.then(function() {
			return notifier.updateLibrary.should.have.been.calledWith(item);
		});
	});

	it('should update library for renamed show', function() {
		notifier.updateLibrary = sinon.spy();
		var item = { type : 'show', state : ItemStates.renamed };
		Item.find = function() {
			return Q([item]);
		};
		return checker().should.be.fulfilled.then(function() {
			return notifier.updateLibrary.should.have.been.calledWith(item);
		});
	});

	it('should update library for renamed music', function() {
		notifier.updateLibrary = sinon.spy();
		var item = { type : 'music', state : ItemStates.renamed };
		Item.find = function() {
			return Q([item]);
		};
		return checker().should.be.fulfilled.then(function() {
			return notifier.updateLibrary.should.have.been.calledWith(item);
		});
	});

	it('should find subtitles for libraryUpdated movie', function() {
		subtitler.findSubtitles = sinon.spy();
		var item = { type : 'movie', state : ItemStates.libraryUpdated };
		Item.find = function() {
			return Q([item]);
		};
		return checker().should.be.fulfilled.then(function() {
			return subtitler.findSubtitles.should.have.been.calledWith(item);
		});
	});

	it('should find subtitles for libraryUpdated show', function() {
		subtitler.findSubtitles = sinon.spy();
		var item = { type : 'show', state : ItemStates.libraryUpdated };
		Item.find = function() {
			return Q([item]);
		};
		return checker().should.be.fulfilled.then(function() {
			return subtitler.findSubtitles.should.have.been.calledWith(item);
		});
	});

	it('should finish libraryUpdated music', function() {
		var item = { type : 'music', state : ItemStates.libraryUpdated };
		item.save = sinon.spy();
		Item.find = function() {
			return Q([item]);
		};
		return checker().should.be.fulfilled.then(function() {
			return item.save.should.have.been.called;
		});
	});
	
	it('should finish subtitled movie', function() {
		var item = { type : 'movie', state : ItemStates.subtitled };
		item.save = sinon.spy();
		Item.find = function() {
			return Q([item]);
		};
		return checker().should.be.fulfilled.then(function() {
			return item.save.should.have.been.called;
		});
	});

	it('should finish subtitled show', function() {
		var item = { type : 'show', state : ItemStates.subtitled };
		item.save = sinon.spy();
		Item.find = function() {
			return Q([item]);
		};
		return checker().should.be.fulfilled.then(function() {
			return item.save.should.have.been.called;
		});
	});

	it('should remove finished item if configured', function() {
		var item = { type : 'show', state : ItemStates.subtitled };
		config.get().removeFinishedDays = 1;
		item.remove = sinon.spy();
		Item.find = function() {
			return Q([item]);
		};
		return checker().should.be.fulfilled.then(function() {
			return item.remove.should.have.been.called;
		});
	});
		
	it('should schedule next check on success', function() {
		var item = { type : 'show', state : ItemStates.subtitled, save : function() {} };
		var count = 0;
		Item.find = function() {
			count++;
			return Q([item]);
		};
		return checker().should.be.fulfilled.then(function() {
			clock.tick(config.get().checkInterval * 1000);
			return count.should.equal(3);
		});
	});
		
	it('should schedule next check on error', function() {
		var errThrown = false;
		var item = { type : 'show', state : ItemStates.subtitled, save : function() { errThrown = true; throw new Error('Err'); } };
		var count = 0;
		Item.find = function() {
			count++;
			return Q([item]);
		};
		return checker().should.be.fulfilled.then(function() {
			clock.tick(config.get().checkInterval * 1000);
			errThrown.should.equal(true);
			return count.should.equal(3);
		});
	});

	it('should schedule next check on no items', function() {
		var count = 0;
		Item.find = function() {
			count++;
			return Q([]);
		};
		return checker().should.be.fulfilled.then(function() {
			clock.tick(config.get().checkInterval * 1000);
			return count.should.equal(3);
		});
	});

	it('should not schedule next check too early', function() {
		var item = { type : 'show', state : ItemStates.subtitled, save : function() {} };
		var count = 0;
		Item.find = function() {
			count++;
			return Q([item]);
		};
		return checker().should.be.fulfilled.then(function() {
			clock.tick(config.get().checkInterval * 1000 - 1);
			return count.should.equal(2);
		});
	});
		
});