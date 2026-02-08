import mongoose from "mongoose";
import dotenv from "dotenv";
import { CategoryModel } from "./src/models/category_model";
import { MONGODB_URI } from "./src/configs";

// Load env vars
dotenv.config();

// Connect to database
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

// Category seed data
const categories = [
    {
        name: "Electronics",
        description: "Phones, laptops, chargers, earbuds, tablets, cameras, etc.",
        status: "active",
    },
    {
        name: "Fashion",
        description: "Clothes, shirts, pants, dresses, jackets, hoodies, casual wear",
        status: "active",
    },
    {
        name: "Beauty",
        description: "Face products, hair products, body wash, makeup, skincare",
        status: "active",
    },
    {
        name: "Jewellery",
        description: "Necklaces, rings, watches, bracelets, earrings, accessories",
        status: "active",
    },
    {
        name: "Toys",
        description: "Action figures, dolls, board games, puzzles, educational toys",
        status: "active",
    },
    {
        name: "Footwear",
        description: "Shoes, sneakers, sandals, boots, slippers, sports shoes",
        status: "active",
    },
    {
        name: "Furniture",
        description: "Chairs, tables, beds, sofas, cabinets, desks, shelves",
        status: "active",
    },
    {
        name: "Home and Living",
        description: "Decor, kitchenware, bedding, curtains, lamps, home essentials",
        status: "active",
    },
    {
        name: "Sports",
        description: "Sports equipment, fitness gear, bicycles, gym accessories",
        status: "active",
    },
];

// Import data
const importData = async () => {
    try {
        await connectDB();

        // Clear existing categories only
        await CategoryModel.deleteMany();
        console.log("✅ Existing categories deleted...");

        // Create categories
        const createdCategories = await CategoryModel.insertMany(categories);
        console.log(`✅ ${createdCategories.length} Categories created`);

        console.log("\n📊 Categories created:");
        createdCategories.forEach((cat, index) => {
            console.log(`   ${index + 1}. ${cat.name} (ID: ${cat._id})`);
        });

        console.log("\n💡 Next steps:");
        console.log("   1. Categories are now ready to use!");
        console.log("   2. You can now create products with these categories");
        console.log("   3. Test the API endpoints with Postman");

        process.exit(0);
    } catch (error) {
        console.error(`❌ Error: ${error}`);
        process.exit(1);
    }
};

// Delete data
const deleteData = async () => {
    try {
        await connectDB();
        await CategoryModel.deleteMany();
        console.log("✅ Categories deleted...");
        process.exit(0);
    } catch (error) {
        console.error(`❌ Error: ${error}`);
        process.exit(1);
    }
};

// Run functions based on command line argument
if (process.argv[2] === "-i") {
    importData();
} else if (process.argv[2] === "-d") {
    deleteData();
} else {
    console.log("⚠️  Please use -i to import or -d to delete data");
    console.log("\nUsage:");
    console.log("  npm run seed:import  (or: ts-node seed-data.ts -i)");
    console.log("  npm run seed:delete  (or: ts-node seed-data.ts -d)");
    process.exit(0);
}
