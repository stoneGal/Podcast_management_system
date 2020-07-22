const express = require('express');
const app = express();
const morgan = require('morgan');
const usersRoute = require('./routes/users');
const podcastRoutes = require('./routes/podcast');

app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', usersRoute);
app.use( podcastRoutes);

app.use((req, res, next) => {
  const err = new Error();
  error.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
      message: err.message,
      error: err,
    });
  });
}

app.listen(3001, () => {
  console.log('App started port 3001');
});
