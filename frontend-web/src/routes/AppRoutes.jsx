import { Route, Routes } from 'react-router-dom';

import LandingPage from '../pages/LandingPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

export default AppRoutes;
