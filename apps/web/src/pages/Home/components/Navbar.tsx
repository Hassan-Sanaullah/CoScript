import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav className='navbar'>
            <div className='navbar-title'>
                <img className='navbar-logo' src='/logo.png' />
                <h1>CoScript</h1>
            </div>
            <div className='navbar-buttons-container'>
                <Link to='/' className='navbar-button'>
                    Home
                </Link>
                {/* <Link to='/editor' className='navbar-button'>
                    Editor
                </Link> */}
                <Link to='/login' className='navbar-button'>
                    Log in
                </Link>
                <Link to='/signup' className='navbar-button'>
                    Sign up
                </Link>
            </div>
        </nav>
    );
}

export default Navbar;
