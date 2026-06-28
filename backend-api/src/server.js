require('dotenv').config();

const { validateEnvironment } = require('./config/env');
const app = require('./app');

const PORT = process.env.PORT || 5000;

validateEnvironment();

app.listen(PORT, () => {
  console.log(`SmartIntern AI backend is running on port ${PORT}`);
});

