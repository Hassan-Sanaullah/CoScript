import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/HomePage';
import Login from './pages/Login/LoginPage';
import Signup from './pages/Signup/SignupPage';
import EditorPage from './pages/Editor/EditorPage';
import Dashboard from './pages/Dashboard/DashboardPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/editor/:id/:userId" element={<EditorPage />} /> 
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
