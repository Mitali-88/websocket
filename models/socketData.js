// models/SocketData.js
// const { DataTypes } = require('sequelize');
import DataTypes from  'sequelize'
import {sequelize} from '../db/db.js'
// const sequelize = require('../db/db.js'); 

const SocketData = sequelize.define('socketData', {
  s_no: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  country: { type: DataTypes.STRING, defaultValue: 'Unknown client' },
  client: { type: DataTypes.STRING, defaultValue: 'Unknown client' },
  lastUpdate: { type: DataTypes.DATE },
  port: { type: DataTypes.STRING, defaultValue: 'Unknown port' },
  node: { type: DataTypes.STRING, defaultValue: 'Unknown node' },
  os: { type: DataTypes.STRING, defaultValue: 'Unknown os' },
  name: { type: DataTypes.STRING, defaultValue: 'Unknown name' },
  id: { type: DataTypes.STRING, defaultValue: 'Unknown id' },
  miner: { type: DataTypes.STRING, defaultValue: 'Unknown miner' },
  ip: { type: DataTypes.STRING, defaultValue: 'Unknown ip' },
  city: { type: DataTypes.STRING, defaultValue: 'unknown city' },
  region: { type: DataTypes.STRING, defaultValue: 'unknown region' },
  blockNumber: { type: DataTypes.STRING, defaultValue: 'unknown number' },
  peer: { type: DataTypes.STRING, defaultValue: 'unknown peer' },
  pending: { type: DataTypes.STRING, defaultValue: 'unknown pending' },
  uptime: { type: DataTypes.STRING, defaultValue: 'unknown uptime' },
  syncing: { type: DataTypes.STRING, defaultValue: 'unknown syncing' },
  timestamp: { type: DataTypes.STRING, defaultValue: 'unknown timestamp' },
  latency: { type: DataTypes.STRING, defaultValue: 'unknown latency' },
  go: { type: DataTypes.STRING, defaultValue: 'unknown go' },
  mainClient: { type: DataTypes.STRING, defaultValue: 'unknown go' },
}, {
  tableName: 'socketData', // Specify the table name
  timestamps: false, // Optional: Specify if you want timestamps (createdAt, updatedAt)
  underscored: false, // Optional: Specify if you want Sequelize to use snake_case for attributes
});

export default SocketData
