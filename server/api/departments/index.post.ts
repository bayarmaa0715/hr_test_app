import { defineEventHandler, readBody, createError } from "h3";
import type { Department, Position } from "../../../types/model";
import { getFirebaseAdmin } from "../../../server/utils/firebase-admin";
import authMiddleware from "../../../middleware/auth.server.js";
export default defineEventHandler(async (event) => {
  await authMiddleware(event);
  const user = event.context.user;
  console.log("POST endpoint reached");
  console.log("User from context:", user);

  const body = await readBody<{
    department?: Partial<Department>;
    positions?: Partial<Position>[];
    position?: Partial<Position>; // Backward compatibility
  }>(event);
  console.log("body reeg", body);
  console.log("body.positions", body.positions);
  console.log("body.position", body.position);
  const admin = getFirebaseAdmin();

  let newDepartment: Department | undefined;
  if (body.department) {
    const depId = crypto.randomUUID();
    newDepartment = {
      id: depId,
      name: body.department.name || "Default Department",
      managerId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await admin.setDocument("departments", depId, newDepartment);
    console.log("New department created:", newDepartment);
  }

  const positionsToProcess =
    body.positions || (body.position ? [body.position] : []);
  console.log("positionsToProcess", positionsToProcess);
  const newPositions: Position[] = [];

  for (const p of positionsToProcess) {
    if (!p.id) {
      const posId = crypto.randomUUID();
      const newPos: Position = {
        id: posId,
        name: p.name || "Default Position",
        departmentId: newDepartment?.id || p.departmentId || "",
        managerId: user.uid,
        description: p.description || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await admin.setDocument("positions", posId, newPos);
      newPositions.push(newPos);
      console.log("New position created:", newPos);
    }
  }

  return {
    success: true,
    department: newDepartment || null,
    positions: newPositions,
  };
});
