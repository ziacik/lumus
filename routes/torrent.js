
/*
 * GET torrent.
 */

exports.torrentSearch = function(req, res){
  res.render('torrent', { title: 'Torrent' });
};