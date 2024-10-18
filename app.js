// Importing the required modules
import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import UserModel from './models/UserModel.js';
import session from 'express-session';
import bcrypt from 'bcrypt';

// Create an Express app
const app = express();

// configuring dotenv
dotenv.config();

const port = process.env.PORT;

// configuring the view engine
app.set('view engine', 'ejs')

// setting up middleware
app.use(morgan('dev')); // logging middleware
app.use(bodyParser.json()) // JSON parsing middleware

// Serving Static file from 'public' directory
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

// Making use of the express-session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

// Define routes
app.get('/', (req, res) => {
    res.render('welcome')
})

// Register route
app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const { username, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = new UserModel({
        username,
        password: hashedPassword,
    })

    await user.save();
    res.redirect('/login')
})

// Login route
app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body

    const isRegistered = await UserModel.findOne({ username });

    if (isRegistered && await bcrypt.compare(password, isRegistered.password)) {
        req.session.userId = isRegistered._id;
        req.session.username = isRegistered.username;

        return res.redirect('/dashboard');
    }

    res.redirect('/login');
})

app.get('/dashboard', (req, res) => {
    res.render('dashboard', {
        username: req.session.username
    })
})

app.listen(port || 3000, () => {
    console.log(`Server is listening to port ${port}`);

    mongoose.connect(process.env.MONGO_URL)
    try {
        console.log('Database Connected');
    } catch (error) {
        console.log('Database not connnected');
    }
})

export default mongoose;