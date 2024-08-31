import AppController from '../controllers/Appcontroller';

const mapRoutes = (app) => {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
};

export default mapRoutes;
module.exports = mapRoutes;
