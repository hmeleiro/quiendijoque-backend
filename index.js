
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
const articlesRouter = require('./routes/articles')
const testRouter = require('./routes/mongotest')
const entitiesRouter = require('./routes/entities')

const app = express();
const port = 3000;

// Setting up the MongoDB URI
const MONGODB_URI = 'mongodb://localhost:27017/quiendijoque'

// Connecting to MongoDB
mongoose.connect(MONGODB_URI)

app.use(morgan('dev'))
app.use(helmet())
app.use(express.json())
app.use(
    cors({
      origin: ['http://quiendijoque.hmeleiro.com', 'http://localhost:3000']
    })
  )

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/', articlesRouter)
app.use('/api/', entitiesRouter)
app.use('/api/', testRouter)


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
