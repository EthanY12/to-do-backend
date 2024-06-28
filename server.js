const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection to SQLite has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

const User = sequelize.define("User", {
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

const Ticket = sequelize.define("Ticket", {
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
});

User.hasMany(Ticket, { foreignKey: "userId" });
Ticket.belongsTo(User, { foreignKey: "userId" });

sequelize.sync();

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    res.status(201).json({ message: "User registered" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Registration failed", error: error.message });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/tickets", async (req, res) => {
  try {
    const tickets = await Ticket.findAll();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
});

app.post("/tickets", async (req, res) => {
  try {
    console.log("Received data:", req.body); // Log received data
    const { title, description, date, time, userId } = req.body;
    if (!title || !description || !date || !time || !userId) {
      throw new Error("Missing required fields");
    }
    const ticket = await Ticket.create(req.body);
    res.json(ticket);
  } catch (error) {
    console.error("Error creating ticket:", error); // Log detailed error
    res
      .status(500)
      .json({ message: "Failed to create ticket", error: error.message });
  }
});

app.put("/tickets/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (ticket) {
      await ticket.update(req.body);
      res.json(ticket);
    } else {
      res.status(404).json({ message: "Ticket not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update ticket", error: error.message });
  }
});

app.delete("/tickets/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (ticket) {
      await ticket.destroy();
      res.json({ message: "Ticket deleted" });
    } else {
      res.status(404).json({ message: "Ticket not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete ticket", error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
