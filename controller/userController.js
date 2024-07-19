const db = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// create main model
const User = db.users;

// main work
// 1. create user
const addUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        const user = await User.create({
            username,
            email,
            password: hashedPassword, // Store the hashed password in the database
        });

        res.status(200).send(user);
        console.log(user);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(400).send('User creation failed');
    }
};

// login user and generate JWT token
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        // Find the user by their username
        const user = await User.findOne({ where: { username } });

        if (!user) {
            res.status(400).send('User not found');
            return;
        }

        // Compare the provided password with the hashed password in the database
        if (bcrypt.compareSync(password, user.password)) {
            // Passwords match, generate a JWT token using your actual secret key
            const token = jwt.sign({ userId: user.id }, 'qwe1234', { expiresIn: '1h' });
           
            return res
                    .cookie("access_token", token, {
                        httpOnly: true,
                        secure: true
                        })
                    .status(200)
                    .json({ 
                        token: token,
                        message: "Logged in successfully 😊 👌" 
                    
                    });

        } else {
            res.status(401).send('Incorrect password');
        }
    } catch (error) {
        res.status(500).send('Login failed');
    }
};



// get all Users
const getAllUsers = async (req, res) => {
    try {
        let users = await User.findAll();
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send('Error fetching users');
    }
};

// get Single User
const getOneUser = async (req, res) => {
    try {
        let id = req.params.id;
        let user = await User.findOne({ where: { id } });
        if (user) {
            res.status(200).send(user);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        res.status(500).send('Error fetching user');
    }
};

// Update user
const updateUser = async (req, res) => {
    let id = req.params.id;
    let user = await User.findOne({ where: { id } });

    if (!user) {
        res.status(404).send('User not found');
        return;
    }

    try {
        // Check if a new password is provided in the request body
        if (req.body.password) {
            // Hash the new password using bcrypt
            const hashedPassword = await bcrypt.hash(req.body.password, 10); // 10 is the salt rounds

            // Update the user's password with the hashed password
            user.password = hashedPassword;
        }

        // Update other user data based on req.body (e.g., username, email)
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;

        // Save the updated user
        await user.save();

        res.status(200).send({ message: 'User updated!' });
    } catch (error) {
        res.status(500).send('Error updating user');
    }
};


// Delete any User
const deleteUser = async (req, res) => {
    try {
        let id = req.params.id;
        const deletedCount = await User.destroy({ where: { id } });
        if (deletedCount > 0) {
            res.status(200).send('User is deleted');
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        res.status(500).send('Error deleting user');
    }
};

module.exports = {
    addUser,
    loginUser,
    getAllUsers,
    getOneUser,
    updateUser,
    deleteUser,
}
