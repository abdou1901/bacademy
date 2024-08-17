const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const session = require('express-session');
require('dotenv').config(); // For environment variables

const app = express();

// Enable CORS
app.use(cors());

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve Static Files
app.use(express.static(path.join(__dirname)));




// Session Middleware
app.use(session({
    secret: 'your_secret_key', // Use environment variable
    resave: false,
    saveUninitialized: true
}));


// Create connection to MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'my_database'
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...');
});

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        return res.status(401).json({ error: 'Not authenticated' });
    }
}

// Register user with password encryption
app.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { username, email, password: hashedPassword };
        const sql = 'INSERT INTO users SET ?';
        db.query(sql, newUser, (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Email already registered' });
                }
                return res.status(500).json({ error: 'Server error' });
            }
            res.json({ message: 'User registered successfully' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all users
app.get('/users', (req, res) => {
    const sql = 'SELECT id, username, email, created_at FROM users';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(results);
    });
});

// Login user
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        if (results.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const user = results[0];
        try {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: 'Invalid email or password' });
            }

            req.session.user = {
                id: user.id,
                username: user.username
            };

            res.json({ message: 'User logged in successfully', username: user.username });
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    });
});

// Route to get logged in user info
app.get('/user-info', ensureAuthenticated, (req, res) => {
    res.json(req.session.user);
});

// Logout user
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

// Create a new task
app.post('/tasks', ensureAuthenticated, (req, res) => {
    const { task, start, end } = req.body;
    console.log(task)
    console.log(start)
    console.log(end)
    const userId = req.session.user.id;
    const sql = 'INSERT INTO tasks (user_id, task, start, end, isCompleted) VALUES (?, ?, ?, ?, false)';
    db.query(sql, [userId, task, start, end], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json({ message: 'Task added successfully' });
    });
});

// Update task status (isCompleted)
app.put('/tasks/:id/status', ensureAuthenticated, (req, res) => {
    const { id } = req.params;
    const { isCompleted } = req.body;
    const sql = 'UPDATE tasks SET isCompleted = ? WHERE id = ? AND user_id = ?';
    db.query(sql, [isCompleted, id, req.session.user.id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json({ message: 'Task status updated successfully' });
    });
});

// Update task details (name and time)
app.put('/tasks/:id', ensureAuthenticated, (req, res) => {
    const { id } = req.params;
    const { task, start, end } = req.body;
    const sql = 'UPDATE tasks SET task = ?, start = ?, end = ? WHERE id = ? AND user_id = ?';
    db.query(sql, [task, start ,end , id, req.session.user.id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json({ message: 'Task details updated successfully' });
    });
});
app.get('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const query = 'SELECT * FROM tasks WHERE id = ?';
    db.query(query, [taskId], (err, results) => {
        if (err) {
            return res.status(500).send('Database query failed');
        }
        if (results.length === 0) {
            return res.status(404).send('Task not found');
        }
        res.json(results[0]);
    });
});


// Delete a task
app.delete('/tasks/:id', ensureAuthenticated, (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM tasks WHERE id = ? AND user_id = ?';
    db.query(sql, [id, req.session.user.id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json({ message: 'Task deleted successfully' });
    });
});


// Get all tasks for a user
app.get('/tasks', ensureAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    const sql = 'SELECT * FROM tasks WHERE user_id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(results);
    });
});

// save spent time in pomodoro in each mode
app.post('/api/saveTime', ensureAuthenticated, (req, res) => {
  const { mode, timeSpent, timestamp } = req.body;
  const userId = req.session.user.id;
  console.log(mode)

  const sql = 'INSERT INTO pomodoro_times (user_id, mode, time_spent, timestamp) VALUES (?, ?, ?, ?)';
  db.query(sql, [userId, mode, timeSpent, timestamp], (err, result) => {
    if (err) {
      console.error('Error saving time data:', err);
      res.status(500).send('Error saving time data');
    } else {
      res.status(200).send('Time data saved successfully');
    }
  });
});


// get the spent time in the last week in each mode
app.get('/spentTime', ensureAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    const sql = 'SELECT * FROM pomodoro_times WHERE user_id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(results);
    });
});
// save goals in the database
app.post('/api/savegoals', ensureAuthenticated, (req, res) => {
    const { daily, weekly, monthly } = req.body;
    const userId = req.session.user.id;

    // SQL query with ON DUPLICATE KEY UPDATE
    const sql = `
        INSERT INTO user_goals (user_id, daily_goal, weekly_goal, monthly_goal) 
        VALUES (?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
            daily_goal = VALUES(daily_goal),
            weekly_goal = VALUES(weekly_goal),
            monthly_goal = VALUES(monthly_goal);
    `;

    db.query(sql, [userId, daily, weekly, monthly], (err, result) => {
      if (err) {
        console.error('Error saving goal data:', err);
        res.status(500).send('Error saving goal data');
      } else {
        res.status(200).send('Goal data saved or updated successfully');
      }
    });
});


// Get goals set by the user
app.get('/get_goals', ensureAuthenticated, (req, res) => {
    const userId = req.session.user.id;
 
    const sql = 'SELECT * FROM user_goals WHERE user_id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(results);
    });
});






const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
