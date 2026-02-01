const Profile = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="bg-white p-6 rounded shadow max-w-md">
      <h1 className="text-xl font-bold mb-4">My Profile</h1>

      <div className="space-y-2">
        <p><strong>ID:</strong> {user?.id}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        <p><strong>Company ID:</strong> {user?.companyId}</p>
      </div>
    </div>
  );
};

export default Profile;
