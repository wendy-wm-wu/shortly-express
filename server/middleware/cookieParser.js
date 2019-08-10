const parseCookies = (req, res, next) => {
    console.log(req.headers)
    if (Object.keys(req.headers).length > 0) {
      var cookiesString = ""+req.headers.cookie;
      let cookiesArray = cookiesString.split('; ').map((item) => {
        return item.split('=');
      });
      let cookies = {};
      for (var arr of cookiesArray) {
        cookies[arr[0]] = arr[1];
      }
      req.cookies = cookies;
      console.log(req.cookies);
    } else {
      req.cookies = {};
    }
      next();
};

module.exports = parseCookies;




// In middleware/cookieParser.js, write a middleware function that will access the cookies on an incoming request, parse them into an object, and assign this object to a cookies property on the request.