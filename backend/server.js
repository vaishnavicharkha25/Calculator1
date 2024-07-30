const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const winston = require('winston');
const expressWinston = require('express-winston');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Initialize express app
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

// Express-winston middleware to log all requests
app.use(expressWinston.logger({
  transports: [
    new winston.transports.File({ filename: path.join(__dirname, 'logs', `${new Date().toISOString().split('T')[0]}.log`) })
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    logFormat
  )
}));

// Setup Sequelize
const sequelize = new Sequelize('calculator', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

// Define the calculator_logs model
const CalculatorLog = sequelize.define('CalculatorLog', {
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
  }
});

// Sync the model with the database
sequelize.sync().then(() => {
  logger.info('Connected to MySQL and synchronized models');
}).catch((error) => {
  logger.error(`Error synchronizing models: ${error.message}`);
});

// POST API to add a record
app.post('/api/logs', async (req, res) => {
  const { expression, is_valid, output } = req.body;
  
  if (!expression) {
    return res.status(400).json({ error: 'Expression is empty' });
  }

  try {
    const log = await CalculatorLog.create({ expression, is_valid, output });
    res.status(201).json(log);
    logger.info(`Created log: ${JSON.stringify(log.toJSON())}`);
  } catch (error) {
    logger.error(`Error creating log: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET API to fetch the latest 10 logs
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await CalculatorLog.findAll({
      limit: 10,
      order: [['created_on', 'DESC']]
    });
    res.json(logs);
    logger.info(`Fetched logs: ${JSON.stringify(logs)}`);
  } catch (error) {
    logger.error(`Error fetching logs: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
