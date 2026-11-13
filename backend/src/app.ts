import express from 'express'
import cors from 'cors'
import searchRouter from './routes/search'
import apartmentsRouter from './routes/apartments'

/** Express app without a listener: served by index.ts locally and by api/index.ts on Vercel. */
const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api', searchRouter)
app.use('/api', apartmentsRouter)

export default app
