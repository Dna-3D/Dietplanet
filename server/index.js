import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'
import { v2 as cloudinary } from 'cloudinary'

const app = express()
const port = process.env.PORT || 8787
const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }) : null

cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET })
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))

const databaseRequired = (request, response, next) => {
  if (!pool) return response.status(503).json({ message: 'DATABASE_URL is not configured.' })
  next()
}
const signToken = (farmer) => jwt.sign({ id: farmer.id, phone: farmer.phone }, process.env.JWT_SECRET || 'development-secret', { expiresIn: '7d' })
const authRequired = (request, response, next) => {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '')
    request.user = jwt.verify(token, process.env.JWT_SECRET || 'development-secret')
    next()
  } catch { response.status(401).json({ message: 'Please sign in to continue.' }) }
}

app.get('/api/health', (request, response) => response.json({ ok: true, service: 'Diet Planet API' }))
app.post('/api/auth/signup', databaseRequired, async (request, response) => {
  try {
    const { name, phone, password } = request.body
    if (!name || !phone || !password) return response.status(400).json({ message: 'Name, phone, and password are required.' })
    const passwordHash = await bcrypt.hash(password, 12)
    const result = await pool.query('INSERT INTO farmers (name, phone, password_hash) VALUES ($1, $2, $3) RETURNING id, name, phone', [name, phone, passwordHash])
    const farmer = result.rows[0]
    response.status(201).json({ token: signToken(farmer), farmer })
  } catch (error) { response.status(error.code === '23505' ? 409 : 500).json({ message: error.code === '23505' ? 'That phone number is already registered.' : 'Could not create your account.' }) }
})
app.post('/api/auth/login', databaseRequired, async (request, response) => {
  const { phone, password } = request.body
  const result = await pool.query('SELECT * FROM farmers WHERE phone = $1', [phone])
  const farmer = result.rows[0]
  if (!farmer || !(await bcrypt.compare(password, farmer.password_hash))) return response.status(401).json({ message: 'Invalid phone number or password.' })
  response.json({ token: signToken(farmer), farmer: { id: farmer.id, name: farmer.name, phone: farmer.phone, avatarUrl: farmer.avatar_url } })
})
app.get('/api/me', databaseRequired, authRequired, async (request, response) => {
  const result = await pool.query('SELECT id, name, phone, avatar_url AS "avatarUrl", created_at AS "createdAt" FROM farmers WHERE id = $1', [request.user.id])
  response.json({ farmer: result.rows[0] })
})
app.get('/api/orders', databaseRequired, authRequired, async (request, response) => {
  const result = await pool.query('SELECT id, crop, mass_kg AS "massKg", settlement, status, created_at AS "createdAt" FROM processing_orders WHERE farmer_id = $1 ORDER BY created_at DESC', [request.user.id])
  response.json({ orders: result.rows })
})
app.post('/api/orders', databaseRequired, authRequired, async (request, response) => {
  const { crop, massKg, settlement, location } = request.body
  const result = await pool.query('INSERT INTO processing_orders (farmer_id, crop, mass_kg, settlement, location) VALUES ($1, $2, $3, $4, $5) RETURNING id, crop, mass_kg AS "massKg", settlement, location, status, created_at AS "createdAt"', [request.user.id, crop, massKg, settlement, location])
  response.status(201).json({ order: result.rows[0] })
})
app.post('/api/cart/sync', databaseRequired, authRequired, async (request, response) => {
  await pool.query('INSERT INTO cart_history (farmer_id, items, total_kobo) VALUES ($1, $2, $3)', [request.user.id, JSON.stringify(request.body.items || []), request.body.totalKobo || 0])
  response.status(201).json({ saved: true })
})
app.get('/api/cart/history', databaseRequired, authRequired, async (request, response) => {
  const result = await pool.query('SELECT id, items, total_kobo AS "totalKobo", created_at AS "createdAt" FROM cart_history WHERE farmer_id = $1 ORDER BY created_at DESC LIMIT 20', [request.user.id])
  response.json({ history: result.rows })
})
app.post('/api/cloudinary/signature', authRequired, (request, response) => {
  if (!process.env.CLOUDINARY_API_SECRET) return response.status(503).json({ message: 'Cloudinary is not configured.' })
  const timestamp = Math.round(Date.now() / 1000)
  response.json({ timestamp, signature: cloudinary.utils.api_sign_request({ timestamp, folder: 'diet-planet/farmers' }, process.env.CLOUDINARY_API_SECRET), cloudName: process.env.CLOUDINARY_CLOUD_NAME, apiKey: process.env.CLOUDINARY_API_KEY, folder: 'diet-planet/farmers' })
})

app.listen(port, () => console.log(`Diet Planet API listening on http://localhost:${port}`))
