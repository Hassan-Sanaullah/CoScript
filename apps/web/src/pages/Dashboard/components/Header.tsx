interface Props {
    username: string;
}

function Header({ username }: Props) {
    return (
        <div className='dashboard-header'>
            <h1 style={{ margin: 0 }}>Collaborative Coding Dashboard</h1>
            <div className='dashboard-profile'>
                {/* <img src="https://via.placeholder.com/35" alt="User Avatar"/> */}
                <span style={{ fontSize: '14px' }}>{username}</span>
            </div>
        </div>
    );
}

export default Header;
