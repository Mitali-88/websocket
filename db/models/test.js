
module.exports = {
    tableName: 'test',
    attributes: {
        s_no: { type: 'serial', primaryKey: true },
        name: { type: 'varchar(255)', default: "'Unknown name'" },
    }
  };
  