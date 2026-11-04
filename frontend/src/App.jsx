
import { useEffect, useState } from 'react';
import './App.css';

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
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [user, setUser] = useState({ ...initialUser });

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting state
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // Fetch all users
  const loadUsers = async () => {
    try {
      setError('');
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      setError(error.message || 'Unable to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Search users by name, city or state
  const filteredUsers = users.filter((item) => {
    const search = searchTerm.trim().toLowerCase();

    return (
      item.name.toLowerCase().includes(search) ||
      item.city.toLowerCase().includes(search) ||
      item.state.toLowerCase().includes(search)
    );
  });

  // Sort filtered users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let valueA = a[sortBy];
    let valueB = b[sortBy];

    if (typeof valueA === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }

    if (valueA < valueB) {
      return sortOrder === 'asc' ? -1 : 1;
    }

    if (valueA > valueB) {
      return sortOrder === 'asc' ? 1 : -1;
    }

    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;

  const currentUsers = sortedUsers.slice(
    startIndex,
    startIndex + usersPerPage
  );

  // Keep page number valid
  useEffect(() => {
    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    } else if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Validate form data
  const validateUser = () => {
    if (user.name.trim().length < 2) {
      return 'Name must contain at least 2 characters.';
    }

    if (user.name.trim().length > 100) {
      return 'Name cannot exceed 100 characters.';
    }

    if (
      user.age === '' ||
      !Number.isInteger(Number(user.age)) ||
      Number(user.age) < 0 ||
      Number(user.age) > 120
    ) {
      return 'Age must be a whole number between 0 and 120.';
    }

    if (!user.city.trim()) {
      return 'City is required.';
    }

    if (!user.state.trim()) {
      return 'State is required.';
    }

    if (user.city.trim().length > 100) {
      return 'City cannot exceed 100 characters.';
    }

    if (user.state.trim().length > 100) {
      return 'State cannot exceed 100 characters.';
    }

    if (!/^\d{4,10}$/.test(user.pincode.trim())) {
      return 'Pincode must contain 4 to 10 digits.';
    }

    return '';
  };

  // Handle input changes
  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });

    setFormError('');
  };

  // Open Add User form
  const openAddForm = () => {
    setEditingId(null);
    setUser({ ...initialUser });
    setFormError('');
    setShowForm(true);
  };

  // Open Edit User form
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

  // Add or Update User
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

      const userData = {
        name: user.name.trim(),
        age: Number(user.age),
        city: user.city.trim(),
        state: user.state.trim(),
        pincode: user.pincode.trim()
      };

      if (editingId !== null) {
        await updateUser(editingId, userData);
      } else {
        await createUser(userData);
      }

      setShowForm(false);
      setUser({ ...initialUser });
      setEditingId(null);
      setCurrentPage(1);

      await loadUsers();

    } catch (error) {
      setFormError(
        error.message || 'Unable to save user. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete User
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete user ID ${id}?`
    );

    if (!confirmed) return;

    try {
      await deleteUser(id);
      await loadUsers();
      alert('User deleted successfully!');
    } catch (error) {
      alert(error.message || 'Unable to delete user.');
    }
  };

  // Close Add/Edit form
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setUser({ ...initialUser });
    setFormError('');
  };

  return (
    <div className="app">

      {/* Sidebar */}
      <aside className="sidebar">
        <h2>UserDirectory</h2>

        <nav>
          <a className="active" href="#dashboard">
            Dashboard
          </a>

          <a href="#users">
            All Users
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">

        {/* Header */}
        <header className="topbar">
          <div>
            <h1>User Directory</h1>
            <p>Manage and organize your users</p>
          </div>

          <button
            className="add-button"
            onClick={openAddForm}
          >
            + Add New User
          </button>
        </header>

        {/* Dashboard Statistics */}
        <section className="stats" id="dashboard">
          <div className="stat-card">
            <span>Total Users</span>
            <h2>{users.length}</h2>
          </div>

          <div className="stat-card">
            <span>Active Directory</span>
            <h2>Users</h2>
          </div>
        </section>

        {/* Users Section */}
        <section className="user-section" id="users">
          <h2>All Users</h2>
          <p>Your registered users will appear here.</p>

          {/* Search */}
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

          {/* Sorting */}
          <div className="sorting-controls">
            <label htmlFor="sortBy">Sort By:</label>

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
                setSortOrder(
                  sortOrder === 'asc' ? 'desc' : 'asc'
                );
                setCurrentPage(1);
              }}
            >
              {sortOrder === 'asc'
                ? 'Ascending ↑'
                : 'Descending ↓'}
            </button>
          </div>

          {/* Loading */}
          {loading && <p>Loading users...</p>}

          {/* API Error */}
          {!loading && error && (
            <div className="error-message">
              {error}
              <button onClick={loadUsers}>
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && sortedUsers.length === 0 && (
            <div className="empty-state">
              <h3>
                {users.length === 0
                  ? 'No users to display'
                  : 'No users found'}
              </h3>

              <p>
                {users.length === 0
                  ? 'Add a user to get started.'
                  : 'Try another name, city or state.'}
              </p>
            </div>
          )}

          {/* Users Table */}
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
                        <td>{item.id}</td>
                        <td>{item.name}</td>
                        <td>{item.age}</td>
                        <td>{item.city}</td>
                        <td>{item.state}</td>
                        <td>{item.pincode}</td>

                        <td>
                          <div className="action-buttons">
                            <button
                              className="edit-button"
                              onClick={() => handleEdit(item)}
                            >
                              Edit
                            </button>

                            <button
                              className="delete-button"
                              onClick={() => handleDelete(item.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="pagination">
                <span className="pagination-info">
                  Showing {startIndex + 1} to{' '}
                  {Math.min(
                    startIndex + usersPerPage,
                    sortedUsers.length
                  )}{' '}
                  of {sortedUsers.length} users
                </span>

                <div className="pagination-controls">
                  <button
                    className="page-button"
                    onClick={() =>
                      setCurrentPage((page) => page - 1)
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>

                  <span className="page-number">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    className="page-button"
                    onClick={() =>
                      setCurrentPage((page) => page + 1)
                    }
                    disabled={currentPage >= totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>
              {editingId !== null
                ? 'Edit User'
                : 'Add New User'}
            </h2>

            <p>Enter the user details below.</p>

            {/* Inline Validation / API Error */}
            {formError && (
              <div className="form-error" role="alert">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={user.name}
                onChange={handleChange}
                minLength={2}
                maxLength={100}
                required
                placeholder="Enter full name"
              />

              <label htmlFor="age">Age</label>
              <input
                id="age"
                type="number"
                name="age"
                value={user.age}
                onChange={handleChange}
                min={0}
                max={120}
                step={1}
                required
                placeholder="Enter age"
              />

              <label htmlFor="city">City</label>
              <input
                id="city"
                type="text"
                name="city"
                value={user.city}
                onChange={handleChange}
                maxLength={100}
                required
                placeholder="Enter city"
              />

              <label htmlFor="state">State</label>
              <input
                id="state"
                type="text"
                name="state"
                value={user.state}
                onChange={handleChange}
                maxLength={100}
                required
                placeholder="Enter state"
              />

              <label htmlFor="pincode">Pincode</label>
              <input
                id="pincode"
                type="text"
                name="pincode"
                value={user.pincode}
                onChange={handleChange}
                pattern="[0-9]{4,10}"
                maxLength={10}
                required
                placeholder="Enter pincode"
              />

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="add-button"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : editingId !== null
                      ? 'Update User'
                      : 'Save User'}
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
