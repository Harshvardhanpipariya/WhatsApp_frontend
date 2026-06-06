import { MoreVertical, Search, LogOut, ShieldBan } from 'lucide-react';
import BlockedUsersModal from './BlockedUsersModal';
import ChatList from './ChatList';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Sidebar = ({ selectedUser, setSelectedUser }) => {
  const { user, token, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const menuRef = useRef();
  const navigate = useNavigate();

  /*
  =====================================
  FETCH ALL USERS (EXCLUDING CURRENT USER)
  =====================================
  */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        throw new Error('No authentication token found');
      }

      const res = await axios.get(
        'http://localhost:5000/api/chatDashboard/allUsers',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const usersList = res.data.users || [];
      const currentUserId = user?._id;

      const filteredUsers = usersList.filter(
        (u) => u._id !== currentUserId
      );

      setUsers(filteredUsers);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        error.message ||
        'Failed to load users'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?._id) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [token, user?._id]);

  /*
  =====================================
  CLOSE MENU ON OUTSIDE CLICK
  =====================================
  */
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        showMenu &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showMenu]);

  /*
  =====================================
  HANDLERS
  =====================================
  */
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleBlockedUsers = () => {
    setShowBlockedModal(true);
    setShowMenu(false);
  };

  /*
  =====================================
  SEARCH FILTER
  =====================================
  */
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    return users.filter((u) =>
      u.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  /*
  =====================================
  RENDER
  =====================================
  */
  return (
    <>
      {showBlockedModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[900]"
          aria-hidden="true"
        />
      )}

      <div className="relative w-full h-full overflow-hidden">
        <div
          className={`
            w-full h-full flex flex-col
            bg-[#0f172a]/80 backdrop-blur-3xl
            border-r border-white/10
            transition-all duration-300
            ${showBlockedModal ? 'blur-md brightness-50 scale-[0.98]' : ''}
          `}
        >
          {/* TOP NAVBAR */}
          <div className="h-16 flex items-center justify-between px-4 bg-white/[0.04] border-b border-white/10">
            {/* USER INFO */}
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={user?.photo || 'https://i.pravatar.cc/40'}
                alt={user?.name || 'User avatar'}
                className="w-10 h-10 rounded-full border border-white/20 object-cover"
                onError={(e) => {
                  e.target.src = 'https://i.pravatar.cc/40';
                }}
              />

              <div className="min-w-0">
                <h1 className="text-white font-semibold truncate">
                  {user?.name || 'User'}
                </h1>
                <p className="text-xs text-gray-400">Online</p>
              </div>
            </div>

            {/* MENU BUTTON */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Menu"
                aria-expanded={showMenu}
                className="p-2 text-gray-300 hover:text-white rounded-xl hover:bg-white/[0.05] transition-colors"
              >
                <MoreVertical size={20} />
              </button>

              {showMenu && (
                <div
                  role="menu"
                  className="absolute right-0 top-12 w-56 rounded-2xl bg-[#111827] border border-white/10 shadow-xl overflow-hidden z-[9999]"
                >
                  <button
                    onClick={handleBlockedUsers}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/[0.05] transition-colors"
                  >
                    <ShieldBan size={18} />
                    Blocked Users
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="p-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 focus-within:border-white/20 focus-within:bg-white/[0.06] transition-all">
              <Search className="text-gray-400 w-4 h-4" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent outline-none text-white placeholder-gray-400"
                aria-label="Search users"
              />
            </div>
          </div>

          {/* CHAT LIST */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="text-gray-400 animate-pulse">Loading...</div>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center p-8">
                <div className="text-red-400 text-center">
                  <p>{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 px-3 py-1 text-sm bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <ChatList
                users={filteredUsers}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
              />
            )}
          </div>
        </div>

        {/* BLOCKED USERS MODAL */}
        {showBlockedModal && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center p-4">
            <BlockedUsersModal
              open={showBlockedModal}
              onClose={() => setShowBlockedModal(false)}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;