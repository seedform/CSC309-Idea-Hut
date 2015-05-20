/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  
  /*
    DESCRIPTION
      Authenticates an user to use the site. If the `register` parameter is 
      set, the user is first registered into the system and then signed in.

    PARAMETERS
      register  - (mutually exclusive with `signIn`) required for registration
      signIn    - required for signing in
      username  - username
      password  - encrypted password
  */
  authenticate: function (req, res) {
    // used to check whether the user wants to register or sign in
    var register = req.param('register');
    var signIn = req.param('signIn');
    var username = req.param('username');
    var password = req.param('password');

    if (!username || !password || username.length < 3 || username.length > 10) {
      req.flash('error', 'Invalid credentials!');
      return res.redirect('/'); // BTFO
    }

    var query = { username: StringService.normalize(username) };

    User.findOne(query).exec( function (err, user) { // check if the user exists
      ErrorService.check(res, err, function () {
        query.password = password;
        
        if (user) { // an user with the given credentials was found
          if (register) { // do not register since the user already exists
            req.flash('error', 'The username "' + query.username + '" is already taken!');
            return res.redirect('/');
          
          } else if (signIn) { // user found, attempt sign in
            User.findOne(query).exec( function (err, user) {
              ErrorService.check(res, err, function () {
                if (user) {    // success
                  req.session.user = user;
                  req.session.authenticated = true;
                  req.flash('success', 'Glad to see you again, ' + user.username + '!');
                
                } else {  // bad credentials
                  req.flash('error', 'Incorrect password!');
                }

                return res.redirect('/');
              });
            });
          }
          
        } else if (register) { // if the user clicked register, then register the user
          User.create(query).exec(function (err, user) {
            ErrorService.check(res, err, function () {
              req.session.user = user;
              req.session.authenticated = true;
              req.flash('success', 'Welcome to Idea Hut, ' + user.username + '!');
              return res.redirect('/');
            });
          });

        } else { // bad request
          req.flash('error', 'The given username and password combination does not exist!');
          return res.redirect('/');
        }
      });
    });
  },

  /*
    DESCRIPTION
      Destroys session
  */
  deauthenticate: function (req, res) {
    req.flash('Successfully signed out!');
    req.session.destroy();
    res.redirect('/');
  }

};

