/**
 * Seed script: Creates dummy venues AND test users for testing venue booking system
 * Run: node seedVenues.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const Venue = require('./models/Venue');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college_management';

const dummyVenues = [
    // Common Resources
    { name: 'SDPK Lab', department: 'Common', capacity: 60 },
    { name: 'Auditorium', department: 'Common', capacity: 250 },
    { name: 'Sopanam Hall', department: 'Common', capacity: 80 },

    // CSE Department
    { name: 'CSE Seminar Hall', department: 'CSE', capacity: 100 },

    // ECE Department
    { name: 'ECE Seminar Hall', department: 'ECE', capacity: 100 },
    { name: 'EC System Lab', department: 'ECE', capacity: 40 },
    { name: 'EC Computer Lab', department: 'ECE', capacity: 45 },

    // MECH Department
    { name: 'MECH Seminar Hall', department: 'ME', capacity: 60 },

    // EEE Department
    { name: 'EEE Seminar Hall', department: 'EEE', capacity: 100 },
    { name: 'EEE CD Lab', department: 'EEE', capacity: 40 },
    { name: 'EEE Computer Lab', department: 'EEE', capacity: 40 },

    // CIVIL Department
    { name: 'Civil Seminar Hall', department: 'CIVIL', capacity: 120 },
    { name: 'Civil Drawing Hall', department: 'CIVIL', capacity: 40 },
    { name: 'Civil Computer Lab', department: 'CIVIL', capacity: 40 },
    { name: 'Civil MT Lab', department: 'CIVIL', capacity: 30 },

    // B.ARCH Department
    { name: 'BArch Seminar Hall', department: 'BARCH', capacity: 80 },
];

const dummyInchargeUsers = [
    { name: 'CSE Incharge', email: 'cse.incharge@college.com', role: 'ResourceIncharge', resourceDepartment: 'CSE', department: 'CSE' },
    { name: 'ECE Incharge', email: 'ece.incharge@college.com', role: 'ResourceIncharge', resourceDepartment: 'ECE', department: 'ECE' },
    { name: 'ME Incharge', email: 'me.incharge@college.com', role: 'ResourceIncharge', resourceDepartment: 'ME', department: 'ME' },
    { name: 'EEE Incharge', email: 'eee.incharge@college.com', role: 'ResourceIncharge', resourceDepartment: 'EEE', department: 'EEE' },
    { name: 'CIVIL Incharge', email: 'civil.incharge@college.com', role: 'ResourceIncharge', resourceDepartment: 'CIVIL', department: 'CIVIL' },
    { name: 'BARCH Incharge', email: 'barch.incharge@college.com', role: 'ResourceIncharge', resourceDepartment: 'BARCH', department: 'BARCH' },
    { name: 'Common Incharge', email: 'common.incharge@college.com', role: 'ResourceIncharge', resourceDepartment: 'Common', department: 'Common' },
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing venues
        await Venue.deleteMany({});
        console.log('Cleared existing venues');

        // Insert dummy venues
        const createdVenues = await Venue.insertMany(dummyVenues);
        console.log(`Inserted ${createdVenues.length} dummy venues:`);
        createdVenues.forEach(v => console.log(`  - ${v.name} (${v.department}, cap: ${v.capacity})`));

        // Create Resource Incharge users (skip if email already exists)
        const defaultPassword = await bcrypt.hash('123456', 10);
        console.log('\nCreating Resource Incharge users...');
        for (const incharge of dummyInchargeUsers) {
            const exists = await User.findOne({ email: incharge.email });
            if (exists) {
                console.log(`  ⚠ ${incharge.name} already exists (${incharge.email}) — skipping`);
                continue;
            }
            await User.create({
                ...incharge,
                password: defaultPassword,
                admissionNumber: incharge.email.split('@')[0].replace('.', '_').toUpperCase()
            });
            console.log(`  ✓ Created ${incharge.name} (${incharge.email}, dept: ${incharge.resourceDepartment})`);
        }

        // Update venues with resourceIncharge references
        console.log('\nLinking venues to their department incharges...');
        for (const venue of createdVenues) {
            const inchargeUser = await User.findOne({ role: 'ResourceIncharge', resourceDepartment: venue.department });
            if (inchargeUser) {
                await Venue.updateOne({ _id: venue._id }, { resourceIncharge: inchargeUser._id });
                console.log(`  ✓ ${venue.name} → ${inchargeUser.name}`);
            }
        }

        console.log('\n✅ Done! Test credentials (password: 123456):');
        dummyInchargeUsers.forEach(u => console.log(`  ${u.name}: ${u.email}`));
        console.log('\nYou can now log in as any incharge to see venue bookings for their department.');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error.message);
        process.exit(1);
    }
}

seed();
