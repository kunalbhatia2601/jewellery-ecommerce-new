import mongoose from 'mongoose';
import { hashPassword } from '../lib/auth';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const adminData = {
    name: 'Admin User',
    email: 'admin@ecommerce.com',
    password: 'admin@ecommerce', // Change this to your desired password
    isAdmin: true
};

async function createAdminUser() {
    try {
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
        const hashedPassword = await hashPassword(adminData.password);

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
    }
}

// Run the function
createAdminUser();