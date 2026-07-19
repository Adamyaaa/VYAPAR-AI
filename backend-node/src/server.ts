import { app } from './app';
import { settings } from './config';

app.listen(settings.PORT, () => {
  console.log(`Hisaab AI API listening on http://localhost:${settings.PORT}`);
});
