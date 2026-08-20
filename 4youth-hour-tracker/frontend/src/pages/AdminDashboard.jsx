import {useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import PendingApprovalCard from '../components/PendingApprovalCard'
import '../styles/AdminDashboard.css'

function AdminDashboard () {
    const name = localStorage.getItem('name')
    const token = localStorage.getItem('token')

    const [worklogs, setWorklogs] = useState([])

    useEffect (() => {
        fetch('http://localhost:3000/api/admin/worklogs', {
            headers: {'Authorization': `Bearer ${token}`}
        }) 
        .then(res => res.json())
        .then(data => setWorklogs(data.filter(w => w.status === 'pending'))) // .filters keep items that match
    }, [])

    const handleApprove = (id) => {
        fetch(`http://localhost:3000/api/admin/worklogs/${id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({status: 'approved'})
        })
        .then(() => setWorklogs(worklogs.filter(w => w.id !== id)))
    }

     const handleDecline = (id) => {
        fetch(`http://localhost:3000/api/admin/worklogs/${id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({status: 'rejected'})
        })
        .then(() => setWorklogs(worklogs.filter(w => w.id !== id)))
    }
return (
    <div className="admin-dash">
        <Navbar />
        <h1>Welcome Back, {name}!</h1>
        <section className='approval-section'>
            <h2>Pending Approvals:</h2>
            {worklogs.length === 0 
                ? (
                    <div className='card no-approvals-card'>
                        <h2><strong>No Pending Approvals</strong></h2>
                        <h2>Next Action Steps:</h2>
                        <button className='btn-summary'>View Current Pay Period Summary</button>
                        <button className='btn-export'> Export PDF</button>
                    </div>
                )
                : worklogs.map(w => ( /* transforms objects from db to react components*/
                    <PendingApprovalCard
                        key={w.id}
                        date={w.date}
                        employeeName={w.users?.name}
                        location={w.institutions?.name}
                        duration={w.extra_hours}
                        reasoning={w.reasoning}
                        onApprove={() => handleApprove(w.id)}
                        onDecline={() => handleDecline(w.id)}
                    />
                ))  
        } 
        </section>
    </div>
)

}

export default AdminDashboard 