const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// ✅ TEMP STORAGE
let users = [];
let events = [];

// ✅ ROOT
app.get('/', (req, res) => {
  res.send('Church Backend API is running 🚀');
});

// ✅ GET ALL EVENTS (PUBLIC)
app.get('/events', (req, res) => {
  res.json(events);
});

// ✅ REGISTER (WITH CHURCH + HALL)
app.post('/register', (req, res) => {
  const { name, email, password, churchName, hall } = req.body;

  if (!name || !email || !password || !churchName || !hall) {
    return res.status(400).json({ message: 'All fields required' });
  }

  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.status(400).json({ message: 'User already exists' });
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

// ✅ LOGIN
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.json({
    message: 'Login successful',
    user
  });
});

// ✅ CREATE EVENT WITH CLASH DETECTION
app.post('/events', (req, res) => {
  const { title, date, time, venue, churchName } = req.body;

  if (!title || !date || !time || !churchName) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const eventStart = new Date(`${date}T${time}`);
  const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000); // 1 hour duration

  // 🔥 CLASH DETECTION
  const clash = events.find(ev => {
    if (
      ev.churchName === churchName &&
      ev.venue === (venue || 'Main Hall') &&
      ev.date === date
    ) {
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
    venue: venue || 'Main Hall',
    churchName
  };

  events.push(newEvent);

  res.json({
    message: 'Event created successfully',
    event: newEvent
  });
});

// ✅ FILTER EVENTS BY CHURCH (OPTIONAL)
app.get('/events/church/:name', (req, res) => {
  const church = req.params.name;

  const filtered = events.filter(
    e => e.churchName.toLowerCase() === church.toLowerCase()
  );

  res.json(filtered);
});

// ✅ START SERVER
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
