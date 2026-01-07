const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(cors())
// Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/quests', require('./routes/quest'));
app.use('/api/users', require('./routes/user'));
app.use('/api/bookings', require('./routes/booking'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));