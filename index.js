const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// ======================
// TEMP STORAGE (NO DB)
// ======================
let users = [];
let events = [];

// ======================
// ROOT
// ======================
app.get('/', (req, res) => {
  res.send('Church Backend API is running 🚀');
});

// ======================
// GET EVENTS (PUBLIC)
// ======================
app.get('/events', (req, res) => {
  res.json(events);
});

// ======================
// REGISTER
// ======================
app.post('/register', (req, res) => {
  let { name, email, password, churchName, hall } = req.body;

  name = name?.trim();
  email = email?.trim();
  password = password?.trim();
  churchName = churchName?.trim();
  hall = hall?.trim();

  if (!name || !email || !password || !churchName || !hall) {
    return res.status(400).json({
      message: 'All fields are required'
    });
  }

  const exists = users.find(u => u.email === email);

  if (exists) {
    return res.status(400).json({
      message: 'User already exists'
    });
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    churchName,
    hall
  };

  users.push(newUser);

  res.json({
    message: 'User registered successfully',
    user: newUser
  });
});

// ======================
// LOGIN
// ======================
app.post('/login', (req, res) => {
  let { email, password } = req.body;

  email = email?.trim();
  password = password?.trim();

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      message: 'Invalid credentials'
    });
  }

  res.json({
    message: 'Login successful',
    user
  });
});

// ======================
// CREATE EVENT (CLASH SAFE)
// ======================
app.post('/events', (req, res) => {
  let { title, date, time, venue, churchName } = req.body;

  title = title?.trim();
  date = date?.trim();
  time = time?.trim();
  venue = venue?.trim() || 'Main Hall';
  churchName = churchName?.trim();

  if (!title || !date || !time || !churchName) {
    return res.status(400).json({
      message: 'All fields are required (title, date, time, churchName)'
    });
  }

  const eventStart = new Date(`${date}T${time}`);
  const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000);

  const clash = events.find(ev => {
    if (ev.venue === venue && ev.date === date) {
      const evStart = new Date(`${ev.date}T${ev.time}`);
      const evEnd = new Date(evStart.getTime() + 60 * 60 * 1000);

      return !(eventEnd <= evStart || eventStart >= evEnd);
    }
    return false;
  });

  if (clash) {
    return res.status(400).json({
      message: `Time clash with "${clash.title}" at ${clash.time}`
    });
  }

  const newEvent = {
    id: Date.now(),
    title,
    date,
    time,
    venue,
    churchName
  };

  events.push(newEvent);

  res.json({
    message: 'Event created successfully',
    event: newEvent
  });
});

// ======================
// EVENTS BY CHURCH
// ======================
app.get('/events/church/:name', (req, res) => {
  const church = req.params.name;

  const filtered = events.filter(
    e => e.churchName.toLowerCase() === church.toLowerCase()
  );

  res.json(filtered);
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
