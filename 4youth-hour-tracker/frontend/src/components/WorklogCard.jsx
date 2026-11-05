import './WorklogCard.css'
import { formatDate } from '../utils/formatters'


function WorklogCard({date, location, duration, shiftType, reasoning, status}) {
    return (
        <div className='worklog-card'>
             <p className='card-date'>{formatDate(date)}</p>
             <p><strong>Location: {location}</strong></p>
             <p><strong>Duration: {duration}</strong></p>
             <p><strong>Shift Type:</strong> {shiftType}</p>
             {shiftType === 'Extra Hours' && <p><strong>Reasoning:</strong> {reasoning}</p>} {/* short-circuit evaluation: && returns the right side only if the left side is truhty */}
             <p><strong>Shift Status:</strong> <span className={`status-dot ${status}`}></span> {status}</p>
        </div>
    )
}

export default WorklogCard