import { useState, useEffect } from "react"
import '../styles/MyHours.css'
import Navbar from '../components/Navbar'
import WorklogCard from '../components/WorklogCard'
import { formatDate } from "../utils/formatters"

function MyHours () {
    const token = localStorage.getItem('token')
    const [worklogs, setWorklogs] = useState([])
    const [payPeriods, setPayPeriods] = useState([])
    const [payPeriodId, setPayPeriodId] = useState(null)

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/employees/pay-periods`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setPayPeriods(data.payPeriods || []))

        fetch(`${import.meta.env.VITE_API_URL}/api/employees/current-pay-period`, { //fetches current pay period and sets payPeriodId 
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => { if (data.payPeriod) setPayPeriodId(data.payPeriod.id) })
    }, [])

   // this useEffect has to wait until payPeriodId is set before it can fetch the worklogs for that pay period.
    useEffect(() => {
        if (!payPeriodId) return // if payPeriodId is null, don't fetch worklogs yet (!null is true, so return early). you want a false result so the fetch runs
        fetch(`${import.meta.env.VITE_API_URL}/api/employees/worklogs?pay_period_id=${payPeriodId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setWorklogs(data.worklogs || []))
    }, [payPeriodId])

    return (
    <div className="my-hours">
        <Navbar />
        <h1>My Hours</h1>

        {/* Pay Period Dropdown */}
        <select
            value={payPeriodId || ''}
            onChange={(e) => setPayPeriodId(Number(e.target.value))}
            className="pay-period-select"
        ><option value="" disabled>Select Pay Period</option>
            {payPeriods.map(p => (
                <option key={p.id} value={p.id}>
                    {p.start_date} - {p.end_date}
                </option>
            ))}
        </select>

        {/* Worklog List */}
        <section className="shift-section">
            {worklogs.length === 0
                ? <div className=" card no-worklogs-card">
                    <p>No worklogs found for this pay period.</p>
                </div>
                : worklogs.map(w => (
                    <WorklogCard
                        key={w.id}
                        date={w.date}
                        location={w.institutions?.name}
                        duration={w.extra_hours}
                        shiftType={w.schedule_id && !w.reasoning ? 'Scheduled Shift' : 'Extra Hours'}
                        reasoning={w.reasoning}
                        status={w.status}
                    />
                ))
            }
        </section>
    </div>
)

}

export default MyHours
