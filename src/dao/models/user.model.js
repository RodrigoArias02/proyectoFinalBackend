import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, 
  },
  age: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cartId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  rol: {
    type: String,
    required: true,
    default: 'user', 
  },
  documents: [{
    name: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
      required: true,
    }
  }],
  last_connection: {
    type: Date,
    default: Date.now
  }
},
{
  strict: false,
});

// Mismo nombre de colección
const UserModelo = mongoose.model('users', userSchema);

export default UserModelo;
