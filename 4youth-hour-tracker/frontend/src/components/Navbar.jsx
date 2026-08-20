import logo from "../assets/logo.png"
import './Navbar.css'

function Navbar() {
    return (
        <header className="navbar">
            <img src={logo} alt="4Youth logo" className="logo-image" />
            <button className="menu-btn">☰</button>
        </header>
    )
}

export default Navbar