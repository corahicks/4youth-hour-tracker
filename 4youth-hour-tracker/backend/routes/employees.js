import express from 'express'
import { verifyToken } from '../middleware/auth.js'
import {
    getMySchedule,
    getFullSchedule,
    confirmAttendance,
    submitExtraHours,
    getMyWorklogs,
    getMyPayPeriodSummary,
    getCurrentPayPeriod,
    getAllPayPeriods,
    getInstitutions
} from '../controllers/employees.js'

const router = express.Router()

// -- Schedule Routes --
router.get('/my-schedule', verifyToken, getMySchedule)
router.get('/full-schedule', verifyToken, getFullSchedule)

// -- Attendance Routes --
router.post('/confirm-attendance', verifyToken, confirmAttendance)

// -- Extra Hours Routes --
router.post('/submit-extra-hours', verifyToken, submitExtraHours)

// -- Worklog Routes --
router.get('/worklogs', verifyToken, getMyWorklogs)
router.get('/pay-period-summary', verifyToken, getMyPayPeriodSummary)

// -- Pay Period Routes --
router.get('/current-pay-period', verifyToken, getCurrentPayPeriod) 
router.get('/pay-periods', verifyToken, getAllPayPeriods)

// -- Institution Routes --
router.get('/institutions', verifyToken, getInstitutions)
export default router
