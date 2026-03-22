import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreatePath from "./pages/CreatePath";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import RoleSelection from "./pages/RoleSelection";
import PathDetail from "./pages/PathDetail";
import UserProfile from "./pages/UserProfile";
import Layout from "./components/Layout";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-path" element={<CreatePath />} />
          <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/path/:id" element={<PathDetail />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;