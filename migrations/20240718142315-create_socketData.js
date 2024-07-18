// ./migrations/[timestamp]-create_socketData_table.js

'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('socketData', {
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
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('socketData');
  }
};
