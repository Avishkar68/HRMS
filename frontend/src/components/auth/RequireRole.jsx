import { Navigate } from "react-router-dom";
import { getAuth } from "../../utils/auth";

const RequireRole = ({ allowedRoles, children }) => {
  const auth = getAuth();
  const redirectPath = allowedRoles.includes("superadmin") ? "/superadmin/login" : "/signin";

  if (!auth) {
    return <Navigate to={redirectPath} replace />;
  }

  const { role } = auth.user;

  if (!allowedRoles.includes(role)) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default RequireRole;
