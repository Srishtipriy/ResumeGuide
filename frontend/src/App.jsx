import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UploadResume from "./pages/UploadResume";
import Results from "./pages/Results";
import History from "./pages/History";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/upload" element={ <ProtectedRoute> <UploadResume /> </ProtectedRoute> } />       {/* Protected routes */}

        <Route path="/results" element={ <ProtectedRoute><Results /> </ProtectedRoute>} />      {/* New analysis → Upload page se aata hai */}

        <Route path="/results/:id" element={ <ProtectedRoute> <Results /> </ProtectedRoute> } />    {/* Old analysis → History se open hota hai */}

        <Route path="/history" element={ <ProtectedRoute> <History /> </ProtectedRoute> } />

        <Route path="/dashboard" element={<ProtectedRoute> <Dashboard /></ProtectedRoute> } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;