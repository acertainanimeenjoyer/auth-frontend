import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  return (
    <div>
      <h2>Welcome, {user?.username}</h2>
      <p>Email: {user?.email}</p>
    </div>
  );
};

export default Profile;
