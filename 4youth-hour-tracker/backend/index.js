import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import employeesRoutes from './routes/employees.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/employees', employeesRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
