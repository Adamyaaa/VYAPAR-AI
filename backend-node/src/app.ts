import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { settings } from './config';
import { supabase } from './lib/supabaseClient';
import { customersRouter } from './routes/customers.routes';
import { transactionsRouter } from './routes/transactions.routes';
import { nudgesRouter } from './routes/nudges.routes';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: settings.BACKEND_CORS_ORIGINS,
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan(settings.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(
  rateLimit({
    windowMs: settings.RATE_LIMIT_WINDOW_MS,
    max: settings.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'Hisaab AI' });
});

// Liveness: is the process up and serving requests at all.
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Readiness: is the configured Supabase project actually reachable.
app.get('/health/db', async (_req, res) => {
  const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
  if (error) {
    return res.status(503).json({ status: 'error', detail: error.message });
  }
  res.json({ status: 'ok' });
});

app.use('/transactions', transactionsRouter);
app.use('/customers', customersRouter);
app.use('/nudges', nudgesRouter);

app.use(notFoundHandler);
app.use(errorHandler);
