// Local development entry: loads backend/.env, then listens. Vercel uses api/index.ts instead.
import 'dotenv/config'
import app from './app'

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API Gateway running on http://localhost:${PORT}`)
})
