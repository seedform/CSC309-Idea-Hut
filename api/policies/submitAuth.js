/**
 * submitAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to disallow anyone from editing another's idea
 *
 */
module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller
  ideaId = req.param('id');
  Idea.findOne({id:ideaId}).exec(function(err, idea) {
    ErrorService.check(res, err, function () {
      var cond = !idea 
        || idea && idea.creator == req.session.user.username 
        || req.session.user.username == 'admin';
      if (cond) {
        return next();
      } else {
        return res.forbidden('You are not permitted to perform this action.');
      }
    });
  });
};
