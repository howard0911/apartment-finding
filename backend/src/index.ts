import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import searchRouter from './routes/search'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api', searchRouter)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API Gateway running on http://localhost:${PORT}`)
})
