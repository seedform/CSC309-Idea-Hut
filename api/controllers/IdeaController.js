
/**
 * IdeaController
 *
 * @description :: Server-side logic for managing Ideas
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

 module.exports = {

  /*
    DESCRIPTION
      Filter ideas given a query string and display them. By default, ideas
      are sorted by popularity (i.e. by rating) in descending order.
    
    PARAMETERS
      category  - idea category
      creator   - original poster's username
      tags      - post tags, with each additional tag separated by whitespace
      newest    - set to sort by date created
  */
  filter: function (req, res) {
    var category = req.param('category');
    var creator = req.param('username');
    var tags = req.param('tags');
    var order = req.param('order');

    // build query
    query = {};
    queryParams = {};
    if (category) query.category = category;
    if (creator) query.creator = StringService.normalize(creator);
    if (tags) {
      tags = StringService.normalize(tags);
      query.tags = {'$all': tags.split(' ')};
    }

    queryParams.sort = {};
    if (order == 'newest') queryParams.sort = 'createdAt DESC';
    else if (order == 'byname') queryParams.sort = 'title ASC';
    else queryParams.sort = 'score DESC';
    queryParams.where = query;


    Idea.find(queryParams).exec(function (err, ideas) {
      ErrorService.check(res, err, function () {
        Category.find({}).exec(function (err, categories) {
          ErrorService.check(res, err, function () {
            query.tags = tags; // switch back to normal form for ejs view
            query.newest = order == 'newest';
            query.byname = order == 'byname';
            return res.view('ideas', {ideas:ideas, query:query, categories:categories});
          });
        });
      });
    });
  },

  /*
    DESCRIPTION
      Opens an existing idea for viewing, or if no id is supplied, sends the
      view for posting a new one. If an idea id is supplied and the idea 
      belongs to the current user, then the view for editing their idea is sent.

    PARAMETERS
      id  - (optional) id of idea to open
  */
  open: function (req, res) {
    if (!req.session.authenticated) { // BTFO
      req.flash('error', 'Sign in or register to experience Idea Hut!');
      return res.redirect('/');
    }

    ideaId = req.param('id');
    locals = {
      viewing: false
    };

    Category.find({}).exec(function (err, categories) { // get all categories first
      ErrorService.check(res, err, function () {
        locals.categories = categories;

        if (ideaId) { // check if the given idea id exists
          Idea.findOne({id:ideaId}).exec(function (err, idea) {
            ErrorService.check(res, err, function () {

              if (idea) { // idea was found, return view with respective locals
                locals.viewing = true;
                locals.idea = idea;
                if (req.session.user && 
                    (req.session.user.username == idea.creator 
                    || req.session.user.username == 'admin')) {
                  return res.view('editor', locals);  
                } else {
                  return res.view('viewer', locals);
                }
                
              } else { // bad id
                return res.view('404');
              }
            });
          });

        } else { // an id wasn't given; new idea
          return res.view('editor', locals);
        }
      });
    });
  },

  /*
    DESCRIPTION
      Saves an exercise by creating a new one if it doesn't exist or updating
      an existing one. An user can only update their own idea (see submitAuth
      policy).

    PARAMETERS
      save        - set to save
      delete      - set to delete
      id          - idea id
      title       - idea title
      description   idea description
      category    - idea category
      tags        - idea tags
  */
  submit: function (req, res) {
    // action to execute
    var save = req.param('save');
    var del = req.param('delete');

    // idea parameters
    ideaId = req.param('id');
    var ideaUpdate = {
      title: req.param('title').trim(), //.makeTitle
      description: req.param('description').trim(),
      category: req.param('category')
    };
    if (req.session.user && req.session.user.username != 'admin') { // admin check
      ideaUpdate.creator = req.session.user.username;
    }
    tags = req.param('tags');
    if (tags) ideaUpdate.tags = StringService.normalize(tags).split(' ').sort();

    // update the idea or create a new one if the id wasn't given
    if (save) {
      Idea.findOrCreate({id:ideaId},{}).exec(function (err, existingIdea) {
        ErrorService.check(res, err, function () {
          if (existingIdea) {
            Idea.update({id:existingIdea.id}, ideaUpdate).exec(function (err, updatedIdea) {
              ErrorService.check(res, err, function () {
                req.flash('success', "Successfully saved and posted your idea!");
                if (updatedIdea) {
                  return res.redirect('/idea/open?id=' + existingIdea.id);
                } else {
                  return res.view('404');
                }
              });
            });

          } else { // shouldn't happen
            res.serverError(JSON.stringify(err));
          }
        });
      });

    } else if (del) {
      Idea.destroy({id:ideaId}).exec(function (err, destroyedIdea) {
        ErrorService.check(res, err, function () {
          req.flash('success', 'Your idea was successfully wiped off the face of this site!')
          return res.redirect('/');
        });
      });

    } else {
      return res.view('404');
    }
  },

  /*
    DESCRIPTION
      Handles AJAX requests for likes and dislikes.

    PARAMETERS
      id    - idea id
      like  - set to `yes` or `no`, signifying a like or dislike, respectively
  */
  like: function (req, res) {
    ideaId = req.param('id'); // id of idea
    like = req.param('like'); // yes or no

    Idea.findOne({id:ideaId}).exec(function (err, idea) {
      ErrorService.check(res, err, function () {
        if (idea) {
          delete idea.id;
          likeIndex = idea.likes.indexOf(req.session.user.username);
          dislikeIndex = idea.dislikes.indexOf(req.session.user.username);

          if (like == 'yes' && likeIndex >= 0) { // remove like
            idea.score--;
            idea.likes.splice(likeIndex, 1);

          } else if (like == 'yes' && likeIndex < 0) { // add like
            idea.score += dislikeIndex < 0 ? 1 : 2;
            idea.dislikes.splice(dislikeIndex, dislikeIndex >= 0 ? 1 : 0);
            idea.likes.push(req.session.user.username);

          } else if (like == 'no' && dislikeIndex >= 0) { // remove dislike
            idea.score++;
            idea.dislikes.splice(dislikeIndex, 1);

          } else if (like == 'no' && dislikeIndex < 0) { // add dislike
            idea.score -= likeIndex < 0 ? 1 : 2;
            idea.likes.splice(likeIndex, likeIndex >= 0 ? 1 : 0);
            idea.dislikes.push(req.session.user.username);
          }

          Idea.update({id:ideaId}, idea).exec(function (err, updatedIdeas) {
            ErrorService.check(res, err, function () {
              return res.ok({result:idea.score});
            });
          });
        
        }
      });
    });
  },

  /*
    DESCRIPTION
      Retrieve the top `k` ideas between the dates `start` and `end` in JSON
      form.

    NOTES
      Uses custom route /api/top/:limit/:start/:end

    PARAMETERS
      limit - total number of ideas to retrieve
      start - start date
      end   - end date
  */
  top: function (req, res) {
    var limit = parseInt(req.param('limit'), 10);
    var start = new Date(req.param('start'));
    var end = new Date(req.param('end'));

    // validation conditions
    var vca = !limit || isNaN(limit);
    var vcb = isNaN(start);
    var vcc =isNaN(end);

    if (vca || vcb || vcc) {
      return res.badRequest({
        limit: vca ? 'INVALID LIMIT "' + req.param('limit') + '" SPECIFIED'  : limit,
        start: vcb ? 'INVALID START DATE "' + req.param('start') + '" SPECIFIED' : req.param('start'),
        end: vcc ? 'INVALID END DATE "' + req.param('end') + '" SPECIFIED' : req.param('end'),
      });
    }

    query = {
      where: {
        createdAt : {
          '>=': start,
          '<=': end
        }
      },
      limit: limit,
      sort: 'score DESC'
    };

    Idea.find(query).exec(function (err, ideas) {
      if (err) {
        return res.serverError(err);
      } else {
        return res.ok(ideas);
      }
    });
  },

  distribution: function (req, res) {
    Category.find({}).exec(function (err, categories) {
      ErrorService.check(res, err, function () {
        dist = {};
        for (var i = 0; i < categories.length; i++) {
          dist[categories[i].title] = 0;
        }
        Idea.find({}).exec(function (err, ideas) {
          ErrorService.check(res, err, function () {
            for (var j = 0; j < ideas.length; j++) {
              cat = ideas[j].category;
              dist[cat] += dist[cat] ? dist[cat] + 1 : 1;
            }
            return res.ok(dist);
          });
        });
      });
    });
  },

  viewDistribution: function (req, res) {
    return res.view('graph');
  }

};

