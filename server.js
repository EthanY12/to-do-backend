const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection to SQLite has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Ticket = sequelize.define('Ticket', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

sequelize.sync();

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    res.status(201).json({ message: 'User registered', user });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ message: 'Username already exists' });
    } else {
      res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/tickets', async (req, res) => {
  const { title, description, date, time } = req.body;
  console.log('Received data:', req.body);
  if (!title || !description || !date || !time) {
    return res.status(400).json({ message: 'Missing required fields', data: req.body });
  }
  try {
    const ticket = await Ticket.create({ title, description, date, time });
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error); // Log detailed error
    res.status(500).json({ message: 'Failed to create ticket', error: error.message });
  }
});

app.get('/tickets', async (req, res) => {
  try {
    const tickets = await Ticket.findAll();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
  }
});

app.put('/tickets/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (ticket) {
      await ticket.update(req.body);
      res.json(ticket);
    } else {
      res.status(404).json({ message: 'Ticket not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update ticket', error: error.message });
  }
});

app.delete('/tickets/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (ticket) {
      await ticket.destroy();
      res.json({ message: 'Ticket deleted' });
    } else {
      res.status(404).json({ message: 'Ticket not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete ticket', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
