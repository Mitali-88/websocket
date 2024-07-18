
import { Sequelize } from 'sequelize';


// Initialize Sequelize with database credentials
const sequelize = new Sequelize('websocket', 'postgres', 'Mitali@88', {
  host: 'localhost',
  dialect: 'postgres',
  port: 5432,
  logging: false, // Disable logging (useful for production)
});

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection to PostgreSQL has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// Export the Sequelize instance for use in other parts of the application
export { sequelize, testConnection };
