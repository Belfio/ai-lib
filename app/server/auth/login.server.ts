import db from "~/@/lib/db";
import { Cred, LoginForm } from "~/@/lib/types";

import bcryptjs from "bcryptjs";
import { randomUUID } from "node:crypto";

export async function login(
  email: string,
  password: string
): Promise<Cred | null> {
  console.log("logging in user");
  // return {
  //   email: "prova@test.it",
  //   passwordHash: "XXX",
  //   createdAt: "XXX",
  //   userId: "XXX",
  // };
  const user = await db.cred.get(email);
  if (!user) {
    console.log("no user");
    throw new Error("User not found");
    return null;
  }
  const isCorrectPassword = await bcryptjs.compare(password, user.passwordHash);
  if (!isCorrectPassword) {
    console.log("password incorrect");
    throw new Error("Password incorrect");
  }
  return user;
}

export async function register({
  email,
  password,
}: LoginForm): Promise<{ status: "ok" } | { status: "error"; error: string }> {
  console.log("registering user", email, password);

  const passwordHash = await bcryptjs.hash(password, 10);
  try {
    const user = await db.cred.get(email);
    if (user) {
      throw new Error("User already exists");
    }
    await db.cred.create({
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
      userId: randomUUID(),
    });
    return { status: "ok" };
  } catch (error) {
    console.log("Error", error);
    throw new Error("User already exists");

    // return { status: "error", error: JSON.stringify(error) || "Error" };
  }
}
