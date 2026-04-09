import { db } from "@hiwave/db";

export async function resolveRenderData(classId: string, studentId: string) {
  const [[student]]: any = await db.query(`SELECT * FROM students WHERE id = ?`, [studentId]);

  const [[classData]]: any = await db.query(`SELECT * FROM classes WHERE id = ?`, [classId]);

  const [fragments]: any = await db.query(`SELECT * FROM fragments WHERE class_id = ? ORDER BY \`order\` ASC`, [
    classId,
  ]);

  if (!student || !classData || !fragments.length) {
    throw new Error("Invalid render data");
  }

  return {
    student,
    classData,
    fragments,
  };
}
