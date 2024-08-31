import AppController from '../controllers/AppController';
import UserController from '../controllers/UserController';

const mapRoutes = (app) => {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
  app.post('/users', UserController.postNew);
};

export default mapRoutes;
module.exports = mapRoutes;
