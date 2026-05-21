import app from './server-app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Design Crawler Server running on http://localhost:${PORT}`);
});
