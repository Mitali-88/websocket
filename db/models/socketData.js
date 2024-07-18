const socketData = {
  tableName: 'socketData',
  attributes: {
      s_no: { type: 'serial', primaryKey: true },
      country: { type: 'varchar(255)', defaultValue: 'Unknown client' },
      client: { type: 'varchar(255)', defaultValue: 'Unknown client' },
      lastUpdate: { type: 'timestamp' },
      port: { type: 'varchar(255)', defaultValue: 'Unknown port' },
      node: { type: 'varchar(255)',defaultValue: 'Unknown node' },
      os: { type: 'varchar(255)', defaultValue: 'Unknown os' },
      name: { type: 'varchar(255)', defaultValue: 'Unknown name' },
      id: { type: 'varchar(255)', defaultValue: 'Unknown id' },
      miner: { type: 'varchar(255)', defaultValue: 'Unknown miner' },
      ip: { type: 'varchar(255)', defaultValue: 'Unknown ip' },
      city: { type: 'varchar(255)', defaultValue: 'unknown city' },
      region: { type: 'varchar(255)', defaultValue: 'unknown region' },
      blockNumber: { type: 'varchar(255)', defaultValue: 'unknown number' },
      peer: { type: 'varchar(255)', defaultValue: 'unknown peer' },
      pending: { type: 'varchar(255)', defaultValue: 'unknown pending' },
      uptime: { type: 'varchar(255)', defaultValue: 'unknown uptime' },
      syncing: { type: 'varchar(255)', defaultValue: 'unknown syncing' },
      timestamp: { type: 'varchar(255)', defaultValue: 'unknown timestamp' },
      latency: { type: 'varchar(255)', defaultValue: 'unknown latency' },
      go: { type: 'varchar(255)', defaultValue: 'unknown go' },
      mainClient: { type: 'varchar(255)', defaultValue: 'unknown go' },
  }
};

export default socketData;
