const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
connectDB();

app.use(bodyParser.json());
app.use('/api', contactRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
