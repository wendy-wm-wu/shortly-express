const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  //if no cookies
  if (Object.keys(req.cookies).length === 0) {
    //create a new session
    models.Sessions.create()
    .then(results => {
      //results.insertId === sessionID that we want
      //select hash from the sessionID and assign it to sessions property
      // console.log(results.insertId,"this is the results ID");
      models.Sessions.get({'id': results.insertId})
      .then(result => {
        req.session = {id: result.id, hash: result.hash, userId: result.userId};
        console.log(req.session, "this is the req session")
      })


      // req.session = models.Sessions.get(results.Id);
      // console.log(req.session);
    })
    .catch((error) => {
      console.log(error);
    });
  }
  //accesses parsed cookies on request
  //looks up user data related to session
  //assigns an object to a session property on the request that contains the user information
  next();
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

