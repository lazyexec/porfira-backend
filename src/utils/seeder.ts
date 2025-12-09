import User from "../modules/user/user.model.ts";
import "../configs/env.ts";
import database from "../configs/database.ts";
const users = [
  {
    name: "John Doe",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
    isEmailVerified: true,
    avatar: "https://example.com/avatar.jpg",
  },
  {
    name: "Jane Smith",
    email: "teacher@example.com",
    password: "password123",
    role: "teacher",
    isEmailVerified: true,
    avatar: "https://example.com/avatar.jpg",
  },
  {
    name: "John Doe",
    email: "student@example.com",
    password: "password123",
    role: "student",
    isEmailVerified: true,
    avatar: "https://example.com/avatar.jpg",
  },
];

const dropDatabase = async () => {
  await User.deleteMany();
};

const seedUsers = async () => {
  users.forEach(async (user) => {
    await User.create(user);
  });
};

const seedDatabase = async () => {
  await database.connect();
  console.log("Database connected");
  await dropDatabase();
  console.log("Database dropped");
  await seedUsers();
};

seedDatabase()
  .then(() => {
    console.log("Database seeded");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding database", error);
    process.exit(1);
  });
