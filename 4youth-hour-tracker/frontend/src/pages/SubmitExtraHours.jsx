import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import '../styles/SubmitExtraHours.css'
import { useNavigate } from "react-router-dom";

function SubmitExtraHours  () {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [reasoning, setReasoning] = useState('');
    const [date, setDate] = useState('');
    const [institutions, setInstitutions] = useState([]);
    const [selectedInstitution, setSelectedInstitution] = useState('');
    const [error, setError] = useState('');
    
    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/employees/institutions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setInstitutions(data.institutions || [])) // sets the institutions state with the retrieved data
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        const payload = {
            date,
            start_time: startTime,
            end_time: endTime,
            reasoning,
            institution_id: Number(selectedInstitution) // convert to number since the backend expects an integer
        };

        fetch(`${import.meta.env.VITE_API_URL}/api/employees/submit-extra-hours`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload) // converts JS object into a JSON string
        })
        .then(res => res.json()) // parse the response as JSON when fetch is finished
        .then(data => {
            if (data.worklog) { // if the response from controller contains a worklog, it means the submission was successful
               navigate('/my-hours') // Navigate to My Hours page after successful submission
                // Reset form fields
                setDate('');
                setStartTime('');
                setEndTime('');
                setReasoning('');
                setSelectedInstitution('');
            } else {
                setError('A worklog already exists for this date. Please contact your administrator if you need to make changes.');
            }
        })
        .catch(err => {
            console.error('Error submitting extra hours:', err);
            setError('An error occurred. Please try again later.');
        });
    }
    return (
        <div className="submit-extra-hours">
            <Navbar />
            <h1>Submit Extra Hours</h1>
            <form className="extra-hours-form" onSubmit={handleSubmit}>
                <label>
                    Date:
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </label>
                <label>
                    Location:
                    <select value = {selectedInstitution} onChange={(e) => setSelectedInstitution(e.target.value)}>
                        <option value="" disabled>Select Institution</option>
                        {institutions.map(inst => (
                            <option key={inst.id} value={inst.id}>{inst.name}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Start Time:
                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </label>
                <label>
                    End Time:
                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </label>
                <label>
                    Reasoning:
                    <textarea value={reasoning} onChange={(e) => setReasoning(e.target.value)} />
                </label>
                {error && <p className="error">{error}</p>}
                <button type="submit">Submit</button>
            </form>
        </div>

    )
}

export default SubmitExtraHours;

