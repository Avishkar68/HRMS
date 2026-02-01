export const getAuth = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
  
    if (!token || !user) return null;
  
    try {
      return {
        token,
        user: JSON.parse(user)
      };
    } catch {
      return null;
    }
  };
  