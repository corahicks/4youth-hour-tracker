import './PendingApprovalCard.css'
import { formatDate } from '../utils/formatters'

function PendingApprovalCard ({date, employeeName, location, duration, reasoning, onApprove, onDecline}) {
    return (
        <div className='approval-card'>
             <p className='card-date'>{formatDate(date)}</p>
             <p><strong>Employee: {employeeName}</strong></p>
             <p><strong>Location: {location}</strong></p>
             <p><strong>Duration: {duration}</strong></p>
             <p><strong>Reasoning: {reasoning}</strong></p>
        <div className='card-buttons'>
             <button className="btn-approve" onClick={onApprove}>Approve</button>
             <button className="btn-decline" onClick={onDecline}>Decline</button>

        </div>
        </div>
    )
}

export default PendingApprovalCard