const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  //if no cookies
  if (Object.keys(req.cookies).length === 0) {
    //create a new session if session does not exist
    models.Sessions.create()
      .then(results => {
        return models.Sessions.get({'id': results.insertId})
      })
      .then(result => {
        res.cookie('shortlyid',result.hash);
        req.session = {hash: result.hash}
      })
      .catch((error) => {
        console.log(error);
      })
      .then(result => {
        next();
      })
  } else {
    //check res.cookie.shortlyid to see if the hash from sessions exists-
    //if it does, then assign req.session to the res.cookie hash
    models.Sessions.get({hash: req.cookies.shortlyid})
    .then(result => {
      if (result !== undefined) {
        req.session  = {}
        req.session.hash = result.hash;
        if (result.user) {
          req.session.userId = result.user.id
          req.session.user = {};
          req.session.user.username = result.user.username;
        }
        next();
      } else {
        delete req.cookies.shortlyid;
        models.Sessions.create()
        .then(results => {
          return models.Sessions.get({'id': results.insertId})
        })
        .then(result => {
          //internal tracking of cookies
          console.log(result, "this is result")
          res.cookies = {shortlyid: result.hash};
          //browser
          res.cookie('shortlyid',result.hash);

          req.session = {hash: result.hash}
        })
        .catch((error) => {
          console.log(error);
        })
        .then(result => {
          next();
        })
      }
      })
  }
};
  /************************************************************/
  // Add additional authentication middleware functions below
  /************************************************************/
