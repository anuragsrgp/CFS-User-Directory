
const API_BASE_URL = 'http://localhost:5218/api/Users';

// GET: Fetch all users
export const getAllUsers = async () => {
  const response = await fetch(API_BASE_URL);

  if (!response.ok) {
    throw new Error('Unable to fetch users.');
  }

  return await response.json();
};

// POST: Create a new user
export const createUser = async (user) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Unable to create user.');
  }

  return await response.json();
};

// PUT: Update an existing user
export const updateUser = async (id, user) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Unable to update user.');
  }

  return await response.json();
};

// DELETE: Delete an existing user
export const deleteUser = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Unable to delete user.');
  }
};
