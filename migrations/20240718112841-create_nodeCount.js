'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('nodeCount', {
      s_no: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      lastUpdate: {
        type: Sequelize.DATE,
      },
      node: {
        type: Sequelize.STRING,
        defaultValue: 'Unknown node',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('nodeCount');
  }
};
