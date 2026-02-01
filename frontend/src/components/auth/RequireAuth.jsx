import { Navigate } from "react-router-dom";
import { getAuth } from "../../utils/auth";

const RequireAuth = ({ children }) => {
  const auth = getAuth();

  if (!auth) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default RequireAuth;
