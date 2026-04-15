import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "hiwave_render",
  typeCast: function (field, next) {
    if (field.type === "JSON") {
      const val = field.string();
      return val ? JSON.parse(val) : null;
    }
    return next();
  },
});
