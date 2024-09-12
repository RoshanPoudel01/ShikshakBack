import { Sequelize } from "sequelize";

// const database = process.env.DB_NAME;
// const username = process.env.DB_USER;
// const password = process.env.DB_PASS;

const connection = new Sequelize({
  database: "ShikshakDB",
  username: "sosuke",
  password: "sosuke",
  dialect: "postgres",
  host: "localhost",
  port: 5432,
});

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
