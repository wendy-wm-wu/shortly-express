const app = require('./app.js');
const db = require('./db');
const port = 4568;

// db.connect(function(err) {
//   if (err) {
//     console.error('error connecting: ' + err.stack);
//     return;
//   }
// });

app.listen(port, () => {
  console.log(`Shortly is listening on ${port}`);
});

