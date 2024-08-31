import mapRoutes from './routes';

const express = require('express');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

mapRoutes(app);
app.listen(port, () => {
  console.log('Server is listening on port', port);
});
