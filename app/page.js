"use client";

import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';

const TaskManager = () => {
  const [user, setUser] = useState(null);
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [priority, setPriority] = useState("Select Priority");
  const [filterOrder, setFilterOrder] = useState('First-Created'); // Default to "First-Created"
  const [searchTerm, setSearchTerm] = useState('');
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser === null) {
        setIsGuest(true);
        const savedTasks = JSON.parse(localStorage.getItem('guestTasks')) || [];
        setTasks(savedTasks);
      } else {
        setIsGuest(false);
        const fetchTasks = async () => {
          try {
            const q = query(collection(db, 'tasks'), where('userId', '==', currentUser.uid));
            const querySnapshot = await getDocs(q);
            setTasks(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          } catch (error) {
            console.error('Error fetching tasks:', error);
          }
        };
        fetchTasks();
      }
    });

    return () => unsubscribe();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (task.trim() && priority !== "Select Priority") {
      const newTask = { task, priority, createdAt: new Date() };

      if (isGuest) {
        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);
        localStorage.setItem('guestTasks', JSON.stringify(updatedTasks));
      } else {
        if (!user) return;
        try {
          const docRef = await addDoc(collection(db, 'tasks'), {
            task,
            priority,
            createdBy: user.uid,
            createdAt: new Date(),
          });
          setTasks([...tasks, { id: docRef.id, ...newTask }]);
        } catch (error) {
          console.error("Error adding task:", error);
        }
      }
      // Reset the fields
      setTask('');
      setPriority('Select Priority'); // Reset the priority dropdown
    } else if (priority === "Select Priority") {
      alert("Please select a valid priority before submitting.");
    }
  };

  const deleteTask = async (id) => {
    if (isGuest) {
      const updatedTasks = tasks.filter((task, index) => index !== id);
      setTasks(updatedTasks);
      localStorage.setItem('guestTasks', JSON.stringify(updatedTasks));
    } else {
      try {
        await deleteDoc(doc(db, 'tasks', id));
        setTasks(tasks.filter(task => task.id !== id));
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const filterTasks = () => {
    let filteredTasks = tasks.filter((task) =>
      task.task.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterOrder === 'High-Low') {
      filteredTasks.sort((a, b) => {
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } else if (filterOrder === 'Low-High') {
      filteredTasks.sort((a, b) => {
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    } else {
      filteredTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    return filteredTasks;
  };

  const clearFilter = () => {
    setSearchTerm('');
    setFilterOrder('First-Created');
  };

  return (
    <div>
      <div>
        <h2>{user ? `Set your projects, ${user.email.split('@')[0]}!` : 'Set your projects!'}</h2>
        <form onSubmit={addTask}>
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Set a Project"
            required
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            required
          >
            <option value="Select Priority" disabled>Select Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <button type="submit" className="submitGoal">Submit Project</button>
        </form>
        <div className="filter">
          <input
            type="text"
            placeholder="Search projects"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={filterOrder}
            onChange={(e) => setFilterOrder(e.target.value)}
          >
            <option value="First-Created">No Filter</option>
            <option value="High-Low">High to Low</option>
            <option value="Low-High">Low to High</option>
          </select>
          <button onClick={clearFilter} className="clearFilterButton">Clear Filter</button>
        </div>
        <div>
          <ul>
            {filterTasks().length > 0 ? (
              filterTasks().map((task, index) => (
                <li key={task.id || index}>
                  {task.task} - <strong>{task.priority}</strong>
                  <button onClick={() => deleteTask(task.id || index)} className="deleteGoal">X</button>
                </li>
              ))
            ) : (
              <p className="noGoalsMessage">No projects made yet.</p>
            )}
          </ul>
          {!user && <span className="loginSuggestion">Log in to save your projects.</span>}
        </div>
      </div>
    </div>
  );
};

export default TaskManager;