import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import employeesRoutes from './routes/employees.js'
import adminRoutes from './routes/admin.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/employees', employeesRoutes)
app.use('/api/admin', adminRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
