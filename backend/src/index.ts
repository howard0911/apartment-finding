// Must load first: services read process.env at import time.
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import searchRouter from './routes/search'
import apartmentsRouter from './routes/apartments'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api', searchRouter)
app.use('/api', apartmentsRouter)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API Gateway running on http://localhost:${PORT}`)
})
