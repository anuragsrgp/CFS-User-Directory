import { useEffect, useState } from 'react';
import './App.css';
import './toast.css';

import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
} from './services/userService';

const initialUser = {
  name: '',
  age: '',
  city: '',
  state: '',
  pincode: ''
};

function App() {
  const [activePage, setActivePage] = useState(
    window.location.hash === '#users' ? 'users' : 'dashboard'
  );
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [user, setUser] = useState({ ...initialUser });
  const [toast, setToast] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const navigateTo = (page) => {
    setActivePage(page);
    window.location.hash = page === 'users' ? 'users' : 'dashboard';
  };

  useEffect(() => {
    const handleHashChange = () => {
      setActivePage(window.location.hash === '#users' ? 'users' : 'dashboard');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const loadUsers = async () => {
    try {
      setError('');
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(error.message || 'Unable to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timerId = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timerId);
  }, [toast]);

  const filteredUsers = users.filter((item) => {
    const search = searchTerm.trim().toLowerCase();
    return (
      String(item.name ?? '').toLowerCase().includes(search) ||
      String(item.city ?? '').toLowerCase().includes(search) ||
      String(item.state ?? '').toLowerCase().includes(search)
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let valueA = a[sortBy];
    let valueB = b[sortBy];

    if (typeof valueA === 'string') {
      valueA = valueA.toLowerCase();
      valueB = String(valueB ?? '').toLowerCase();
    }

    if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = sortedUsers.slice(startIndex, startIndex + usersPerPage);

  useEffect(() => {
    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    } else if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const cityCount = new Set(
    users.map((item) => String(item.city ?? '').trim().toLowerCase()).filter(Boolean)
  ).size;

  const stateCount = new Set(
    users.map((item) => String(item.state ?? '').trim().toLowerCase()).filter(Boolean)
  ).size;

  const validateUser = () => {
    if (user.name.trim().length < 2) return 'Name must contain at least 2 characters.';
    if (user.name.trim().length > 100) return 'Name cannot exceed 100 characters.';
    if (
      user.age === '' ||
      !Number.isInteger(Number(user.age)) ||
      Number(user.age) < 0 ||
      Number(user.age) > 120
    ) {
      return 'Age must be a whole number between 0 and 120.';
    }
    if (!user.city.trim()) return 'City is required.';
    if (!user.state.trim()) return 'State is required.';
    if (user.city.trim().length > 100) return 'City cannot exceed 100 characters.';
    if (user.state.trim().length > 100) return 'State cannot exceed 100 characters.';
    if (!/^\d{4,10}$/.test(user.pincode.trim())) {
      return 'Pincode must contain 4 to 10 digits.';
    }
    return '';
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setFormError('');
  };

  const openAddForm = () => {
    setEditingId(null);
    setUser({ ...initialUser });
    setFormError('');
    setShowForm(true);
  };

  const handleEdit = (selectedUser) => {
    setEditingId(selectedUser.id);
    setUser({
      name: selectedUser.name,
      age: String(selectedUser.age),
      city: selectedUser.city,
      state: selectedUser.state,
      pincode: selectedUser.pincode
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateUser();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSaving(true);
      setFormError('');

      const wasEditing = editingId !== null;
      const userData = {
        name: user.name.trim(),
        age: Number(user.age),
        city: user.city.trim(),
        state: user.state.trim(),
        pincode: user.pincode.trim()
      };

      if (wasEditing) {
        await updateUser(editingId, userData);
      } else {
        await createUser(userData);
      }

      setShowForm(false);
      setUser({ ...initialUser });
      setEditingId(null);
      setCurrentPage(1);
      await loadUsers();

      // After adding a new user, open the All Users page.
      navigateTo('users');
      showToast(
        wasEditing ? 'User updated successfully!' : 'User added successfully!',
        'success'
      );
    } catch (error) {
      const message = error.message || 'Unable to save user. Please try again.';
      setFormError(message);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(`Are you sure you want to delete user ID ${id}?`);
    if (!confirmed) return;

    try {
      await deleteUser(id);
      await loadUsers();
      showToast('User deleted successfully!', 'success');
    } catch (error) {
      showToast(error.message || 'Unable to delete user.', 'error');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setUser({ ...initialUser });
    setFormError('');
  };

  return (
    <div className="app">
      {toast && (
        <div className={`toast-notification toast-${toast.type}`} role="status" aria-live="polite">
          <span className="toast-icon" aria-hidden="true">
            {toast.type === 'success' ? '✓' : '!'}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => setToast(null)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      <aside className="sidebar">
        <div className="brand-mark">UD</div>
        <h2>UserDirectory</h2>
        <p className="sidebar-caption">MANAGEMENT</p>
        <nav>
          <a
            className={activePage === 'dashboard' ? 'active' : ''}
            href="#dashboard"
            onClick={() => setActivePage('dashboard')}
          >
            <span className="nav-icon">▦</span> Dashboard
          </a>
          <a
            className={activePage === 'users' ? 'active' : ''}
            href="#users"
            onClick={() => setActivePage('users')}
          >
            <span className="nav-icon">♙</span> All Users
          </a>
        </nav>
        <div className="sidebar-footer">User Directory App</div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">USER MANAGEMENT</span>
            <h1>{activePage === 'dashboard' ? 'Dashboard Overview' : 'All Users'}</h1>
            <p>
              {activePage === 'dashboard'
                ? 'A quick overview of your user directory.'
                : 'View, search and manage all registered users.'}
            </p>
          </div>
          <button className="add-button" onClick={openAddForm}>
            <span>＋</span> Add New User
          </button>
        </header>

        {activePage === 'dashboard' && (
          <section className="dashboard-page" id="dashboard">
            <div className="welcome-panel">
              <div>
                <span className="welcome-label">WELCOME BACK</span>
                <h2>Your directory, at a glance.</h2>
                <p>Keep your user information organized in one simple place.</p>
                <button className="welcome-button" onClick={() => navigateTo('users')}>
                  View All Users <span>→</span>
                </button>
              </div>
              <div className="welcome-art" aria-hidden="true">
                <div className="art-circle circle-one"></div>
                <div className="art-circle circle-two"></div>
                <div className="art-person">♙</div>
              </div>
            </div>

            <div className="section-heading">
              <div>
                <span className="eyebrow">DIRECTORY SUMMARY</span>
                <h2>Key Statistics</h2>
              </div>
              <span className="live-label"><span></span> Live data</span>
            </div>

            {loading ? (
              <div className="loading-state">
                <span className="loading-spinner" aria-hidden="true"></span>
                <span>Loading dashboard...</span>
              </div>
            ) : error ? (
              <div className="error-message">
                {error}
                <button onClick={loadUsers}>Retry</button>
              </div>
            ) : (
              <div className="stats">
                <div className="stat-card stat-blue">
                  <div className="stat-top">
                    <span className="stat-icon">♙</span>
                    <span className="stat-tag">DIRECTORY</span>
                  </div>
                  <span className="stat-label">Total Users</span>
                  <h3>{users.length}</h3>
                  <p>Registered user records</p>
                </div>

                <div className="stat-card stat-purple">
                  <div className="stat-top">
                    <span className="stat-icon">⌖</span>
                    <span className="stat-tag">LOCATION</span>
                  </div>
                  <span className="stat-label">Cities Covered</span>
                  <h3>{cityCount}</h3>
                  <p>Unique cities in your directory</p>
                </div>

                <div className="stat-card stat-teal">
                  <div className="stat-top">
                    <span className="stat-icon">◎</span>
                    <span className="stat-tag">REGION</span>
                  </div>
                  <span className="stat-label">States Covered</span>
                  <h3>{stateCount}</h3>
                  <p>Unique states in your directory</p>
                </div>
              </div>
            )}

            <div className="dashboard-tip">
              <div className="tip-icon">i</div>
              <div>
                <h3>Manage your directory</h3>
                <p>Use All Users to search, sort, edit or remove a user record.</p>
              </div>
              <button onClick={() => navigateTo('users')}>Open directory →</button>
            </div>
          </section>
        )}

        {activePage === 'users' && (
          <section className="user-section" id="users">
            <div className="section-heading users-heading">
              <div>
                <span className="eyebrow">USER DIRECTORY</span>
                <h2>All Registered Users</h2>
                <p>Your registered users appear in this list.</p>
              </div>
              <span className="count-pill">{users.length} users</span>
            </div>

            <input
              type="text"
              className="search-input"
              placeholder="Search by name, city or state..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />

            <div className="sorting-controls">
              <label htmlFor="sortBy">Sort by</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="id">ID</option>
                <option value="name">Name</option>
                <option value="age">Age</option>
                <option value="city">City</option>
                <option value="state">State</option>
              </select>
              <button
                className="sort-button"
                onClick={() => {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  setCurrentPage(1);
                }}
              >
                {sortOrder === 'asc' ? 'Ascending ↑' : 'Descending ↓'}
              </button>
            </div>

            {loading && (
              <div className="loading-state" role="status" aria-live="polite">
                <span className="loading-spinner" aria-hidden="true"></span>
                <span>Loading users...</span>
              </div>
            )}

            {!loading && error && (
              <div className="error-message">
                {error}
                <button onClick={loadUsers}>Retry</button>
              </div>
            )}

            {!loading && !error && sortedUsers.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">♙</div>
                <h3>{users.length === 0 ? 'No users yet' : 'No users found'}</h3>
                <p>
                  {users.length === 0
                    ? 'Add your first user to get started.'
                    : 'Try another name, city or state.'}
                </p>
                {users.length === 0 && (
                  <button className="add-button" onClick={openAddForm}>＋ Add First User</button>
                )}
              </div>
            )}

            {!loading && !error && sortedUsers.length > 0 && (
              <>
                <div className="table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Age</th>
                        <th>City</th>
                        <th>State</th>
                        <th>Pincode</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((item) => (
                        <tr key={item.id}>
                          <td><span className="id-chip">#{item.id}</span></td>
                          <td className="user-name-cell">{item.name}</td>
                          <td>{item.age}</td>
                          <td>{item.city}</td>
                          <td>{item.state}</td>
                          <td>{item.pincode}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="edit-button" onClick={() => handleEdit(item)}>
                                Edit
                              </button>
                              <button className="delete-button" onClick={() => handleDelete(item.id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pagination">
                  <span className="pagination-info">
                    Showing {startIndex + 1} to {Math.min(startIndex + usersPerPage, sortedUsers.length)} of {sortedUsers.length} users
                  </span>
                  <div className="pagination-controls">
                    <button
                      className="page-button"
                      onClick={() => setCurrentPage((page) => page - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <span className="page-number">Page {currentPage} of {totalPages}</span>
                    <button
                      className="page-button"
                      onClick={() => setCurrentPage((page) => page + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        )}
      </main>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-heading">
              <span className="modal-icon">＋</span>
              <div>
                <h2>{editingId !== null ? 'Edit User' : 'Add New User'}</h2>
                <p>Enter the user details below.</p>
              </div>
              <button className="modal-close" type="button" onClick={closeForm} aria-label="Close">
                ×
              </button>
            </div>

            {formError && <div className="form-error" role="alert">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <label htmlFor="name">Name</label>
              <input
                id="name" type="text" name="name" value={user.name}
                onChange={handleChange} minLength={2} maxLength={100}
                required placeholder="Enter full name"
              />

              <label htmlFor="age">Age</label>
              <input
                id="age" type="number" name="age" value={user.age}
                onChange={handleChange} min={0} max={120} step={1}
                required placeholder="Enter age"
              />

              <label htmlFor="city">City</label>
              <input
                id="city" type="text" name="city" value={user.city}
                onChange={handleChange} maxLength={100}
                required placeholder="Enter city"
              />

              <label htmlFor="state">State</label>
              <input
                id="state" type="text" name="state" value={user.state}
                onChange={handleChange} maxLength={100}
                required placeholder="Enter state"
              />

              <label htmlFor="pincode">Pincode</label>
              <input
                id="pincode" type="text" name="pincode" value={user.pincode}
                onChange={handleChange} pattern="[0-9]{4,10}" maxLength={10}
                required placeholder="Enter pincode"
              />

              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={closeForm} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="add-button" disabled={saving}>
                  {saving ? 'Saving...' : editingId !== null ? 'Update User' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
