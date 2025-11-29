const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(` MongoDB Connected: ${conn.connection.host}`);
        console.log(` Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(' Database connection error:', error.message);
        process.exit(1);
    }
};


// Mock database functions for development
const mockDB = {
  users: [],
  
  async createUser(userData) {
    const user = {
      _id: Date.now().toString(),
      ...userData,
      createdAt: new Date(),
      comparePassword: function(password) {
        return Promise.resolve(password === this.password);
      }
    };
    this.users.push(user);
    return user;
  },
  
  async findUser(query) {
    return this.users.find(user => 
      user.email === query.email || user.username === query.username
    );
  },
  
  async findUserById(id) {
    return this.users.find(user => user._id === id);
  }
};

module.exports = connectDB;