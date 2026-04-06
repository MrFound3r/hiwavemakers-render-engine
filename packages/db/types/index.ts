import { RowDataPacket } from "mysql2";

type DbRow<T> = T & RowDataPacket;
type DbRows<T> = DbRow<T>[];

export { DbRow, DbRows };
