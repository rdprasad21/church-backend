const express = require('express');
const cors = require('cors');

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// TEMP STORAGE (no database for now)
let users = [];
let events = [];

// ✅ ROOT ROUTE
app.get('/', (req, res) => {
  res.send('Church Backend API is running 🚀');
});

// ✅ GET EVENTS
app.get('/events', (req, res) => {
  res.json(events);
});

// ✅ REGISTER
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  // simple validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields required' });
  }

  // check if user exists
  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = { id: Date.now(), name, email, password };
  users.push(newUser);

  res.json({ message: 'User registered successfully' });
});

// ✅ LOGIN
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.json({
    message: 'Login successful',
    user
  });
});

// ✅ CREATE EVENT
app.post('/events', (req, res) => {
  const { title, date, time, venue } = req.body;

  if (!title || !date || !time) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const newEvent = {
    id: Date.now(),
    title,
    date,
    time,
    venue
  };

  events.push(newEvent);

  res.json({ message: 'Event created', event: newEvent });
});

// ✅ START SERVER
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
