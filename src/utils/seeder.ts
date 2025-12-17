import User from "../modules/user/user.model";
import env from "../configs/env";
import mongoose from "mongoose";

const password = "$2a$08$cUQ3uMdbQjlyDF/dgn5mNuEt9fLJZqq8TaT9aKabrFuG5wND3/mPO"; // password: 1qazxsw2

const users = [
  {
    name: "John Doe",
    email: "admin@example.com",
    password: password,
    role: "admin",
    isEmailVerified: true,
    avatar: "https://example.com/avatar.jpg",
  },
  {
    name: "Jane Smith",
    email: "teacher@example.com",
    password: password,
    role: "teacher",
    isEmailVerified: true,
    avatar: "https://example.com/avatar.jpg",
  },
  {
    name: "John Doe",
    email: "student@example.com",
    password: password,
    role: "student",
    isEmailVerified: true,
    avatar: "https://example.com/avatar.jpg",
  },
];

const createRandomUsers = (count = 20) => {
  const users: any[] = [];
  const roles = ["admin", "teacher", "student"];
  roles.map((role) => {
    for (let i = 0; i <= count; i++) {
      users.push({
        name: `User ${role} ${i + 1}`,
        email: `${role}${i + 1}@example.com`,
        password: password,
        role: role,
        isEmailVerified: true,
        avatar: "https://example.com/avatar.jpg",
      });
    }
  });
  return users;
};
const seedUsers = async () => {
  await User.insertMany(users);
};

const seedDatabase = async () => {
  await mongoose.connect(env.MONGO_URI);
  console.log("Database connected");
  await mongoose.connection.dropDatabase();
  console.log("Database dropped successfully!");
  await seedUsers();
  console.log("Users seeded successfully!");
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
