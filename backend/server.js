const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const winston = require('winston');
const expressWinston = require('express-winston');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

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

const sequelize = new Sequelize('calculator', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

const CalculatorLog = sequelize.define('CalculatorLog', {
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
  }
});

sequelize.sync().then(() => {
  logger.info('Connected to MySQL and synchronized models');
}).catch((error) => {
  logger.error(`Error synchronizing models: ${error.message}`);
});

app.post('/api/logs', async (req, res) => {
  const { expression, is_valid, output } = req.body;
  
  if (!expression) {
    return res.status(400).json({ error: 'Expression is empty' });
  }

  try {
    const log = await CalculatorLog.create({ expression, is_valid, output });
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

app.get('/api/logs', async (req, res) => {
  try {
    const logs = await CalculatorLog.findAll({
      // limit: 10,
      order: [['created_on', 'DESC']]
    });
    res.json(logs);
    logger.info(`Fetched logs: ${JSON.stringify(logs)}`);
  } catch (error) {
    logger.error(`Error fetching logs: ${error.message}`);
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
// app.get('/api/logs/long-polling', async (req, res) => {
//   const { lastId } = req.query;
//   const lastIdNum = parseInt(lastId, 10) || 0;
//   const POLL_INTERVAL = 5000; // Adjust as needed

//   // Set headers for streaming
//   res.setHeader('Content-Type', 'application/json');
//   res.setHeader('Transfer-Encoding', 'chunked');

//   const checkForNewLogs = async () => {
//     try {
//       // Fetch new logs with ID greater than lastIdNum
//       const newLogs = await CalculatorLog.findAll({
//         where: {
//           id: {
//             [Sequelize.Op.gt]: lastIdNum
//           }
//         },
//         limit: 5, // Limit to the latest 5 logs
//         order: [['created_on', 'DESC']] // Ascending order by creation time
//       });

//       if (newLogs.length > 0) {
//         // Send logs as a chunk
//         res.write(JSON.stringify(newLogs));
//         res.end(); // End the response
//       } else {
//         // No new logs, set a timeout and check again
//         setTimeout(checkForNewLogs, POLL_INTERVAL);
//       }
//     } catch (error) {
//       logger.error('Error in long polling', { error });
//       res.status(500).json({ message: 'Internal Server Error' });
//     }
//   };

//   checkForNewLogs();

//   req.on('close', () => {
//     logger.info('Client disconnected from long polling');
//   });
// });



// app.get('/api/logs/long-polling', async (req, res) => {
//   const { lastId } = req.query;
//   const lastIdNum = parseInt(lastId, 10) || 0;
//   const POLL_INTERVAL = 3000; // 3 seconds interval

//   res.setHeader('Content-Type', 'application/json');
//   res.setHeader('Transfer-Encoding', 'chunked');

//   const checkForNewLogs = async () => {
//     try {
//       const newLogs = await CalculatorLog.findAll({
//         where: {
//           id: {
//             [Sequelize.Op.gt]: lastIdNum
//           }
//         },
//         limit: 5, 
//         order: [['created_on', 'DESC']] 
//       });

//       if (newLogs.length > 0) {
//         res.write(JSON.stringify(newLogs));
//         res.end(); 
//       } else {
//         setTimeout(checkForNewLogs, POLL_INTERVAL);
//       }
//     } catch (error) {
//       logger.error('Error in long polling', { error });
//       res.status(500).json({ message: 'Internal Server Error' });
//     }
//   };

//   checkForNewLogs();

//   req.on('close', () => {
//     logger.info('Client disconnected from long polling');
//   });
// });

app.get('/api/logs/long-polling', async (req, res) => {
  const { lastId } = req.query;
  const lastIdNum = parseInt(lastId, 10) || 0;
  const POLL_INTERVAL = 3000; // 3 seconds interval

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Transfer-Encoding', 'chunked');

  const sendLogs = async (logs) => {
    for (const log of logs) {
      res.write(JSON.stringify(log));
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }
    res.end();
  };

  const checkForNewLogs = async () => {
    try {
      const newLogs = await CalculatorLog.findAll({
        where: {
          id: {
            [Sequelize.Op.gt]: lastIdNum
          }
        },
        limit: 5,
        order: [['created_on', 'DESC']]
      });

      if (newLogs.length > 0) {
        await sendLogs(newLogs);
      } else {
        setTimeout(checkForNewLogs, POLL_INTERVAL);
      }
    } catch (error) {
      logger.error('Error in long polling', { error });
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  checkForNewLogs();

  req.on('close', () => {
    logger.info('Client disconnected from long polling');
  });
});


app.delete('/api/logs', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    await CalculatorLog.destroy({
      where: {
        id: ids
      }
    });
    res.status(200).json({ message: 'Logs deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
