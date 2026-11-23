'use strict'
// Microservicio de eventos/usuarios: persiste eventos de reproducción en Cloud Firestore.
// Ejecutar con: node -r newrelic index.js
const express = require('express')
// firebase-admin 14 expone solo la API modular (no existe admin.credential.cert).
const { initializeApp, cert } = require('firebase-admin/app')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')

const PORT = process.env.PORT || 3000
const COLECCION = 'eventos_reproduccion'

// Inicialización del SDK Admin con la clave de cuenta de servicio.
// La ruta del JSON llega por GOOGLE_APPLICATION_CREDENTIALS (fuera del repositorio).
let db = null
let errorFirebase = null
try {
  if (!process.env.FIRESTORE_EMULATOR_HOST && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('Defina GOOGLE_APPLICATION_CREDENTIALS (ruta al JSON de la cuenta de servicio)')
  }
  const credencial = process.env.FIRESTORE_EMULATOR_HOST
    ? undefined
    : cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS))
  initializeApp({
    ...(credencial && { credential: credencial }),
    projectId: process.env.FIREBASE_PROJECT_ID
  })
  db = getFirestore()
} catch (e) {
  errorFirebase = e.message
  console.error('[firebase] No se pudo inicializar el SDK:', errorFirebase)
}

const app = express()
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ servicio: 'eventos-node', firestore: db ? 'conectado' : 'sin_credenciales' })
})

// Registra un evento de reproducción (documento nuevo en Firestore).
app.post('/eventos', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Firestore no inicializado', detalle: errorFirebase })
  const { usuario_id, track_id, album_id, tipo_evento } = req.body || {}
  if (!usuario_id || !track_id || !tipo_evento) {
    return res.status(400).json({ error: 'usuario_id, track_id y tipo_evento son obligatorios' })
  }
  try {
    const evento = {
      usuario_id,
      track_id,
      album_id: album_id ?? null,
      tipo_evento,
      fecha: FieldValue.serverTimestamp()
    }
    const ref = await db.collection(COLECCION).add(evento)
    res.status(201).json({ id: ref.id, ...req.body })
  } catch (e) {
    res.status(500).json({ error: 'Error al escribir en Firestore', detalle: e.message })
  }
})

// Lista los últimos eventos registrados.
app.get('/eventos', async (_req, res) => {
  if (!db) return res.status(503).json({ error: 'Firestore no inicializado', detalle: errorFirebase })
  try {
    const snap = await db.collection(COLECCION).orderBy('fecha', 'desc').limit(20).get()
    res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  } catch (e) {
    res.status(500).json({ error: 'Error al leer Firestore', detalle: e.message })
  }
})

app.listen(PORT, () => console.log(`eventos-node escuchando en http://localhost:${PORT}`))
