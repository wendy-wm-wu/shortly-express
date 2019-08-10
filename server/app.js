const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');
const app = express();
var db = require('../server/db/index.js')

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));



app.get('/',
(req, res) => {
  res.render('index');
});

app.get('/create',
(req, res) => {
  res.render('index');
});

app.get('/links',
(req, res, next) => {
  models.Links.getAll()
    .then(links => {
      res.status(200).send(links);
    })
    .error(error => {
      res.status(500).send(error);
    });
});

app.post('/links',
(req, res, next) => {
  var url = req.body.url;
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then(link => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then(title => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin
      });
    })
    .then(results => {
      return models.Links.get({ id: results.insertId });
    })
    .then(link => {
      throw link;
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(link => {
      res.status(200).send(link);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/
app.get('/signup', function (req, res) {
  res.render('signup');
  res.send('GET request to the signup page');
});

app.post('/signup',(req, res) => {
  var username = req.body.username
  var password = req.body.password
  models.Users.create({username, password})
  .then(results => {
    res.redirect('/');
  })
  .error(error => {
    res.redirect('/signup');
  })
});

app.get('/login', function (req, res) {
      // return index.Users.get({username: username})
      //  .then(username => {
      //    if (username) {
      //      throw username;
      //    }
      //    return res.redirect('/signup');
      //  }
      res.render('login');
  res.send('GET request to the login page');
});

app.post('/login', function (req, res) {
  //when user logs in, only username is kept in database with the salt and encrpyted password. user's password will be thrown out in the process.
  let newObj = {'username': req.body.username};
    models.Users.get(newObj)
    .then(results => {
      if (results === undefined) {
        res.redirect('/login');
      } else if (results !== undefined) {
        if (models.Users.compare(req.body.password, results.password, results.salt)) {
          res.redirect('/');
        } else {
          res.redirect('/login');
        }
      }
    })
    .catch(err => {
      console.log(err, "this is the error");
    })
});


/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
