const socketData = {
  tableName: 'socketData',
  attributes: {
      s_no: { type: 'serial', primaryKey: true },
      country: { type: 'varchar(255)', default: "'Unknown client'" },
      client: { type: 'varchar(255)', default: "'Unknown client'" },
      lastUpdate: { type: 'timestamp' },
      port: { type: 'varchar(255)', default: "'Unknown port'" },
      node: { type: 'varchar(255)', default: "'Unknown node'" },
      os: { type: 'varchar(255)', default: "'Unknown os'" },
      name: { type: 'varchar(255)', default: "'Unknown name'" },
      id: { type: 'varchar(255)', default: "'Unknown id'" },
      miner: { type: 'varchar(255)', default: "'Unknown miner'" },
      ip: { type: 'varchar(255)', default: "'Unknown ip'" },
      city: { type: 'varchar(255)', default: "'unknown city'" },
      region: { type: 'varchar(255)', default: "'unknown region'" },
      BlockNumber: { type: 'varchar(255)', default: "'unknown number'" },
      peer: { type: 'varchar(255)', default: "'unknown peer'" },
      pending: { type: 'varchar(255)', default: "'unknown pending'" },
      uptime: { type: 'varchar(255)', default: "'unknown uptime'" },
      syncing: { type: 'varchar(255)', default: "'unknown syncing'" },
      timestamp: { type: 'varchar(255)', default: "'unknown timestamp'" },
      latency: { type: 'varchar(255)', default: "'unknown latency'" },
      go: { type: 'varchar(255)', default: "'unknown go'" },
      mainClient: { type: 'varchar(255)', default: "'unknown go'" },
  }
};

export default socketData;
