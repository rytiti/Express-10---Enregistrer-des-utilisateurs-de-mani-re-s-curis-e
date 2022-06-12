const moviesRouter = require('./movies');
const usersRouter = require('./users');
const authRouter = require('./auth')

const setupRoutes = (app) => {
  // Movie routes
  app.use('/api/movies', moviesRouter);
  // User routes
  // TODO
  app.use('/api/users', usersRouter);
  // Auth routes
  app.use('/api/auth', authRouter);
};

module.exports = {
  setupRoutes,
};
