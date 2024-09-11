const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const winston = require('winston');
const expressWinston = require('express-winston');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    logFormat
  ),
  transports: [
    new winston.transports.File({ filename: path.join(__dirname, 'logs', `${new Date().toISOString().split('T')[0]}.log`) })
  ]
});

app.use(expressWinston.logger({
  transports: [
    new winston.transports.File({ filename: path.join(__dirname, 'logs', `${new Date().toISOString().split('T')[0]}.log`) })
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    logFormat
  )
}));

// Database configuration
const DB_HOST = 'localhost';
const DB_USER = 'root';
const DB_PASSWORD = ''; // Add your MySQL password here
const DB_NAME = 'calculator';

// JWT secret key
const ACCESS_TOKEN_SECRET = '13mfndskgjdfbgdgjgmhhhhhhhhhtj'; // Change this to a strong, random string

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'mysql'
});

// Define User model
// Define User model
const User = sequelize.define('user', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 15],
    },
  },
  lastName: {
    type: DataTypes.STRING,
    validate: {
      len: [3, 15],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      len: [5, 50],
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 10,
      max: 115,
    },
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [10, 100],
    },
  },
  primaryColor: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 10],
    },
  },
  secondaryColor: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 10],
    },
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: true,
      len: [10, 500],
    },
  },
});


sequelize.sync().then(() => {
  logger.info('Connected to MySQL and synchronized models');
}).catch((error) => {
  logger.error(`Error synchronizing models: ${error.message}`);
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification failed:', err.message);
      return res.sendStatus(403);
    }
    req.user = user;
    console.log('Authenticated user:', req.user); // Check if req.user contains the expected properties
    next();
  });
};





// User registration endpoint
app.post('/api/register', async (req, res) => {
  const { firstName, lastName, email, password, age, address, primaryColor, secondaryColor, logo } = req.body;

  if (!firstName || !email || !password || !age || !address || !primaryColor || !secondaryColor || !logo) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      age,
      address,
      primaryColor,
      secondaryColor,
      logo
    });
    res.status(201).json(user);
  } catch (error) {
    logger.error(`Error registering user: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Add a log to verify user ID
    console.log('User ID during login:', user.id);

    const token = jwt.sign({ id: user.id, email: user.email }, ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error(`Error logging in: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});




// Get user profile endpoint
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id); // Use req.user.id instead of req.query.email_address
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email, age, address, primaryColor, secondaryColor, logo } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is missing' });
    }

    // Use findByPk instead of findById
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.age = age || user.age;
    user.address = address || user.address;
    user.primaryColor = primaryColor || user.primaryColor;
    user.secondaryColor = secondaryColor || user.secondaryColor;
    user.logo = logo || user.logo;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Define CalculatorLog model
const UserCalculatorLog = sequelize.define('UserCalculatorLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  expression: {
    type: DataTypes.STRING,
    allowNull: false
  },
  is_valid: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  output: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  created_on: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  userId: {  // This field should be defined
    type: DataTypes.INTEGER,
    references: {
      model: 'users', // Make sure this matches the table name exactly
      key: 'id'
    },
    allowNull: false // Ensure this field is not null
  }
});



// Calculator Log Routes
app.post('/api/logs', authenticateToken, async (req, res) => {
  const { expression, is_valid, output } = req.body;
  const userId = req.user.id; // This should be a valid userId

  if (!expression) {
    return res.status(400).json({ error: 'Expression is empty' });
  }

  try {
    console.log('User ID:', userId); // Debugging line
    const log = await UserCalculatorLog.create({ expression, is_valid, output, userId });
    res.status(201).json(log);
    logger.info(`Created log: ${JSON.stringify(log.toJSON())}`);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(log));
      }
    });
  } catch (error) {
    logger.error(`Error creating log: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.get('/api/logs', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const logs = await UserCalculatorLog.findAll({
      where: { userId },
      order: [['created_on', 'DESC']]
    });
    res.json(logs);
    logger.info(`Fetched logs for userId ${userId}: ${JSON.stringify(logs)}`);
  } catch (error) {
    logger.error(`Error fetching logs for userId ${userId}: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});





app.delete('/api/logs', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    await UserCalculatorLog.destroy({
      where: {
        id: ids
      }
    });
    res.status(200).json({ message: 'Logs deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket connection established');
  ws.on('message', (message) => {
    console.log('received:', message);
  });
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
});

const PORT = 5000; // Change this if you need a different port
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
