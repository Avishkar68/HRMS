export const allowRoles = (...roles) => {
  return (req, res, next) => {
    const userRole = (req.user?.role || "").toString().toLowerCase();
    const allowed = roles.map((r) => r.toString().toLowerCase());
    if (!userRole || !allowed.includes(userRole)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
  