import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "../pages/Welcome";
import Login from "../pages/Login";
import RegisterEmail from "../pages/RegisterEmail";
import RegisterDetails from "../pages/RegisterDetails";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterEmail />} />
        <Route path="/register/details" element={<RegisterDetails />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;