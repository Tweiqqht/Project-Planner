'use client';

import './globals.css';
import { useState, useEffect } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';

const Layout = ({ children }) => {
  const [showFragment, setShowFragment] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, []);

  const toggleFragment = (type) => {
    setIsLogin(type === 'login');
    setShowFragment(true);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (password !== confirmPassword) {
          alert("Passwords do not match!");
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const docRef = await addDoc(collection(db, "users"), {
          userId: user.uid,
          email: email,
        });
  
        console.log("User document created with ID:", docRef.id);
      }
      closeFragment(); // Close the fragment after successful login/register
  
      // Reset the email, password, and confirmPassword fields
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };
  
  const closeFragment = () => {
    setShowFragment(false);
    // Reset the email, password, and confirmPassword fields when closing the fragment
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const toggleDarkMode = () => {
    const newDarkModeState = !isDarkMode;
    setIsDarkMode(newDarkModeState);

    if (newDarkModeState) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    localStorage.setItem('darkMode', newDarkModeState);
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" type="x-icon" href="icon.png"></link>
        <title>Project Planner</title>
      </head>
      <body>
        <div className="container">
          <header className="header">
            <h1>Project Planner</h1>
            <div className="auth-buttons">
              <button id="darkModeToggle" onClick={toggleDarkMode} className="Mode">
                {isDarkMode ? '☼' : '☽'}
              </button>
              {user ? (
                <button onClick={handleLogout}>Logout</button>
              ) : (
                <>
                  <button onClick={() => toggleFragment('login')}>Login</button>
                  <button onClick={() => toggleFragment('register')}>Register</button>
                </>
              )}
            </div>
          </header>
          <main>{children}</main>

          {showFragment && (
            <div className="fragment-overlay">
              <div className="fragment">
                <button className="close-btn" onClick={closeFragment}>✖</button>
                <h2>{isLogin ? 'Login' : 'Register'}</h2>
                <form onSubmit={handleAuth}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {!isLogin && (
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  )}
                  <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </body>
    </html>
  );
};

export default Layout;