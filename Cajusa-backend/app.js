require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const authRouter = require('./routes/auth');
const auth = require('./middlewares/auth');

const errorHandler = require('./middlewares/error-handler');
const NotFoundError = require('./errors/NotFoundError');
const { requestLogger, errorLogger } = require('./middlewares/logger');



const {
  PORT = 3000,
  MONGO_URI,
  FRONTEND_URL,
  FRONTEND_URL_WWW,
  NODE_ENV,
} = process.env;

const app = express();

const corsOptions = {
  origin: NODE_ENV === 'production' ? [FRONTEND_URL, FRONTEND_URL_WWW] : [FRONTEND_URL, 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());

app.use(requestLogger);

app.use('/', authRouter);

app.use('/users', auth, usersRouter);
app.use('/products', productsRouter);

app.use( (req, res, next) => {
  next(new NotFoundError('Recurso no encontrado'));
});

app.use(errorLogger);

app.use(errorHandler);


mongoose.set('strictQuery', true);
mongoose.connect(MONGO_URI, {serverSelectionTimeoutMS: 5000, socketTimeoutMS: 5000})
  .then(() => {
    console.log(`✅ MongoDB conectado: ${MONGO_URI}`);
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => console.error('❌ Error conectando a MongoDB:', err));





