import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/login.css';
import logo from '../assets/logo.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook to navigate programmatically
  const [error, setError] = useState('');

  const handleSubmit =  async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    // Handle login logic here
    setLoading(true);
    setError(''); // Clear any previous error messages

    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
        setError(data.message || "Login failed. Please try again.");
        return
    }

    // store the token, role, and name in localStorage so other pages can access them without making another API call
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role); 
    localStorage.setItem('name', data.name);
    navigate(data.role === 'admin' ? '/admin-dashboard' : '/dashboard'); // Navigate based on role
  }


    return (
        <div className="login-page">
            <img src={logo} alt="4Youth logo" className={loading ? "logo-image spinning"  : "logo-image"}/>
            <h1>Four Youth Pulse</h1>
            <div className="card">
                <h2>Sign In:</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p> }
                    <button type="submit">Login</button>
                    
                </form>
            </div>
        </div>
    );
}


export default Login;