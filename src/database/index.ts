import { Sequelize } from "sequelize";

// const database = process.env.DB_NAME;
// const username = process.env.DB_USER;
// const password = process.env.DB_PASS;

const connection = new Sequelize({
  database: "ShikshakDB",
  username: "aadarsh",
  password: "aadarsh",
  dialect: "postgres",
  host: "localhost",
  port: 5432,
});

// const connection = new Sequelize({
//   database: "postgres",
//   username: "postgres.yvavpzqcmysgjrekfoiz",
//   password: "ykOtRoBLo0s2Voge",
//   dialect: "postgres",
//   host: "aws-0-ap-southeast-1.pooler.supabase.com",
//   port: 6543,
// });

try {
  connection.authenticate();
  console.log("Connection has been established successfully.");
  connection.sync({ alter: true }).then(() => {
    console.log("Database & tables created!");
  });
  console.log("All models were synchronized successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

export default connection;
