import { Navigate } from "react-router-dom";
import { getAuth } from "../../utils/auth";

const RequireRole = ({ allowedRoles, children }) => {
  const auth = getAuth();

  if (!auth) {
    return <Navigate to="/signin" replace />;
  }

  const { role } = auth.user;

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default RequireRole;
