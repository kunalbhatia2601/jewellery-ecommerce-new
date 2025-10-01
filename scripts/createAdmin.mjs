import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const adminData = {
    name: 'Admin User',
    email: 'admin@ecommerce.com',
    password: 'admin@ecommerce', // Change this to your desired password
    isAdmin: true
};

// Define User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Create User model
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createAdminUser() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminData.email });
        
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(adminData.password, 12);

        // Create admin user
        const admin = await User.create({
            ...adminData,
            password: hashedPassword
        });

        console.log('Admin user created successfully:', admin.email);

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

// Run the function
createAdminUser();