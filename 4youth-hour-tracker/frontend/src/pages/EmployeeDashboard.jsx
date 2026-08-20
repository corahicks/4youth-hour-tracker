import { useState, useEffect } from "react"
import '../styles/EmployeeDashboard.css'
import Navbar from '../components/Navbar'
import { formatDate, formatTime } from "../utils/formatters";



function EmployeeDashboard () {
    const name = localStorage.getItem('name');
    const token = localStorage.getItem('token');

    const [schedule, setSchedule] = useState([]);
    const [totalHours, setTotalHours] = useState(0); // useState is set to zero to represent a number
    const [attendanceSubmitted, setAttendanceSubmitted] = useState(null);

    const today = new Date().toISOString().split('T')[0];
    const todayShift = schedule.find(s => s.date === today) || null;  //.finds searches through the array to find the date match

    useEffect(() => {
        fetch('http://localhost:3000/api/employees/my-schedule', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setSchedule(data.schedules)) //pulls the specific part of the schedule
    }, []);

    useEffect(() => {
        fetch('http://localhost:3000/api/employees/pay-period-summary', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setTotalHours(data.totalHours || 0))
    }, []);

    const handleAttendance = (attended) => {
        fetch('http://localhost:3000/api/employees/confirm-attendance', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ schedule_id: todayShift.id, attended })  // converts JS object into  a JSON string
        })
        .then(res => res.json())
        .then(() => setAttendanceSubmitted(attended ? 'present' : 'absent'))
    };

    return (
        <div className="employee-dash">

            <Navbar />
            <h1>Welcome Back, {name}!</h1>

            <section className="shift-section">
                <h2>Today's Shift:</h2>
                <div className="card">
                    {todayShift ? (
                        attendanceSubmitted === 'present'
                            ? <p><strong>Attendance confirmed. Have a great shift!</strong></p>
                            : attendanceSubmitted === 'absent'
                                ? <p><strong>Absence recorded. See you next time!</strong></p>
                                : (
                                    <>
                                        <p><strong>Date:</strong> {formatDate(todayShift.date)}</p>
                                        <p><strong>Time:</strong> {formatTime(todayShift.start_time)} - {formatTime(todayShift.end_time)}</p>
                                        <p><strong>Location:</strong> {todayShift.institutions?.name}</p>
                                        <h3 className="confirm-label">Confirm Attendance:</h3>
                                        <div className="attendance-buttons">
                                            <button className="btn-present" onClick={() => handleAttendance(true)}>Present</button>
                                            <button className="btn-absent" onClick={() => handleAttendance(false)}>Absent</button>
                                        </div>
                                    </>
                                )
                    ) : (
                        <p>No shift today!</p>
                    )}
                </div>
            </section>

            <section className="pay-summary">
                <div className="card">
                    <p><strong>Current Pay Period Approved Hours:</strong> {totalHours} hrs</p>
                    <button className="btn-worklog">View Worklog</button>
                </div>
            </section>

        </div>
    )
}

export default EmployeeDashboard
