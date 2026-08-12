import express from 'express'
import { requireAdmin, verifyToken } from '../middleware/auth.js'
import {
    createUser,
    getAllUsers,
    updateUser,
    deleteUser,
    getAllSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getAllWorklogs,
    updateWorklogStatus,
    exportPayPeriodPDF
} from '../controllers/admin.js'

const router = express.Router()

// -- User Management Routes --
router.post('/users', verifyToken, requireAdmin, createUser)
router.get('/users', verifyToken, requireAdmin, getAllUsers)
router.patch('/users/:id', verifyToken, requireAdmin, updateUser) //patch is used for partial updates, put is used for full updates
router.delete('/users/:id', verifyToken, requireAdmin, deleteUser)

// -- Schedule Management Routes --
router.post('/schedules', verifyToken, requireAdmin, createSchedule)
router.get('/schedules', verifyToken, requireAdmin,getAllSchedules)
router.patch('/schedules/:id', verifyToken, requireAdmin, updateSchedule)
router.delete('/schedules/:id', verifyToken, requireAdmin, deleteSchedule)

// -- Worklog Management Routes --
router.get('/worklogs', verifyToken, requireAdmin, getAllWorklogs)
router.patch('/worklogs/:id', verifyToken, requireAdmin, updateWorklogStatus)

// -- Export Pay Period PDF Route --
router.get('/pay-period/:id/export', verifyToken, requireAdmin, exportPayPeriodPDF)

export default router