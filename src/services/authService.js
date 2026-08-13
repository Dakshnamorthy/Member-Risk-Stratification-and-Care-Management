/**
 * Authentication Service
 * 
 * Replace the mock logic in this file with real API calls (e.g., fetch or axios)
 * when you connect to your backend.
 */

export const loginUser = async (email, password) => {
  // TODO: Replace with real API call
  // const response = await fetch('YOUR_API_URL/login', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, password })
  // });
  // if (!response.ok) throw new Error('Login failed');
  // return await response.json();

  // --- MOCK IMPLEMENTATION ---
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!email || !password) {
        reject(new Error('Email and password are required.'));
        return;
      }

      // Parse name from email (e.g., jane.doe@... -> Jane Doe)
      let name = "Dr. Roberts";
      if (email) {
        const prefix = email.split('@')[0];
        const parts = prefix.split('.');
        name = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      }

      // Return mock user data
      resolve({
        token: 'mock-jwt-token-12345',
        user: {
          name,
          email,
          role: 'Attending Physician'
        }
      });
    }, 800); // simulate network delay
  });
};

export const logoutUser = () => {
  // TODO: Any backend logout logic can go here (e.g., invalidating token)
  localStorage.removeItem('currentUser');
  localStorage.removeItem('authToken');
};
