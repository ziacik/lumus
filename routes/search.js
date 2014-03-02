
/*
 * GET search.
 */

exports.runSearch = function(req, res){
  res.render('search', { title: 'Lumus' });
};