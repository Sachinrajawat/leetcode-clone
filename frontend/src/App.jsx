import { Routes, Route, Navigate } from "react-router";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { checkAuth } from "./authSlice"; // Make sure your import path is correct!
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import ProblemPage from "./pages/ProblemPage";
import CreateProblem from "./components/CreateProblem";
import AdminDelete from "./components/AdminDelete";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  // Grab isLoading alongside isAuthenticated
  const { isAuthenticated, isLoading, user } = useSelector(
    (state) => state.auth,
  );
  const dispatch = useDispatch();
  // console.log("Current User in App.jsx:", user);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // The Magic Gatekeeper:
  // While waiting for the backend to check the cookie, show nothing (or a spinner)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-xl font-semibold">Loading...</h1>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Homepage /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" /> : <Signup />}
        />
        {/* New Admin Dashboard Route */}
        <Route 
          path="/admin" 
          element={
            isAuthenticated && user?.role === 'admin' ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/" />
            )
          } 
        />

        {/* The Create Problem Form Route */}
        <Route 
          path="/admin/create" 
          element={
            isAuthenticated && user?.role === 'admin' ? (
              <CreateProblem />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
        <Route 
          path="/admin/delete" 
          element={
            isAuthenticated && user?.role === 'admin' ? (
              <AdminDelete />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
        <Route
          path="/problem/:problemId"
          element={isAuthenticated ? <ProblemPage /> : <Navigate to="/login" />}
        />
      </Routes>
    </>
  );
}

export default App;
