// models/SocketData.js
import DataTypes from  'sequelize'
import {sequelize} from '../db/db.js'

const NodeData = sequelize.define('nodeCount', {
  s_no: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
 
  lastUpdate: { type: DataTypes.DATE },
  node: { type: DataTypes.STRING, defaultValue: 'Unknown node' },

  
}, {
  tableName: 'nodeCount', 
  timestamps: true, 
  underscored: false, 
});

export default NodeData ;
