import express from 'express';
import cors from 'cors';
import { settings } from './config';
import { customersRouter } from './routes/customers.routes';
import { transactionsRouter } from './routes/transactions.routes';
import { nudgesRouter } from './routes/nudges.routes';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';

export const app = express();

app.use(
  cors({
    origin: settings.BACKEND_CORS_ORIGINS,
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'Hisaab AI' });
});

app.use('/transactions', transactionsRouter);
app.use('/customers', customersRouter);
app.use('/nudges', nudgesRouter);

app.use(notFoundHandler);
app.use(errorHandler);
