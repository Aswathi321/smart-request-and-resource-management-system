/**
 * Seed script: Creates equipment inventory for every department
 * Run: node seedEquipments.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Equipment = require('./models/Equipment');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college_management';

const departments = ['CSE', 'ECE', 'ME', 'Common'];

const equipmentDefaults = [
    { name: 'Podium', quantity: 4 },
    { name: 'Mic', quantity: 4 },
    { name: 'Speaker', quantity: 2 },
    { name: 'Projector', quantity: 3 },
    { name: 'Chair', quantity: 200 },
    { name: 'Bench & Desk', quantity: 150 },
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing equipment
        await Equipment.deleteMany({});
        console.log('Cleared existing equipment');

        const toInsert = [];
        for (const dept of departments) {
            for (const eq of equipmentDefaults) {
                toInsert.push({
                    name: eq.name,
                    quantity: eq.quantity,
                    department: dept
                });
            }
        }

        const created = await Equipment.insertMany(toInsert);
        console.log(`\nInserted ${created.length} equipment entries:\n`);

        for (const dept of departments) {
            console.log(`  ${dept} Department:`);
            created
                .filter(e => e.department === dept)
                .forEach(e => console.log(`    - ${e.name}: ${e.quantity}`));
        }

        console.log('\n✅ Equipment seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error.message);
        process.exit(1);
    }
}

seed();
