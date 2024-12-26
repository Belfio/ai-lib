import { User, LoginForm, UserCompanyProfile } from "@/lib/types";
import db from "@/lib/db";

import { hash, compare } from "bcryptjs";

export async function login(
  email: string,
  password: string
): Promise<User | null> {
  console.log("logging in user");
  // return {
  //   email: "prova@test.it",
  //   passwordHash: "XXX",
  //   createdAt: "XXX",
  //   userId: "XXX",
  // };
  const user = await db.user.get(email);
  if (!user) {
    console.log("no user");
    throw new Error("User not found");
  }
  const isCorrectPassword = await compare(password, user.passwordHash);
  if (!isCorrectPassword) {
    console.log("password incorrect");
    throw new Error("Password incorrect");
    return null;
  }
  return user;
}

export async function register({
  email,
  password,
  companyName,
  name,
  surname,
}: LoginForm): Promise<{ status: "ok" } | { status: "error"; error: string }> {
  console.log("registering user", email, password);

  try {
    const hashedEmail = await hash(email, 10);
    const user = await db.user.get(hashedEmail);
    if (user) {
      throw new Error("User already exists");
    }
    const hashedName = await hash(companyName, 10);
    const companyProfile: UserCompanyProfile = {
      PK: hashedName,
      company: companyName,
      profileImageUrl: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const userProfile: User = {
      email,
      name: name || email.split("@")[0],
      surname: surname || "",
      passwordHash: await hash(password, 10),
      createdAt: new Date().toISOString(),
      PK: hashedEmail,
      companyName,
      companyId: hashedName,
      updatedAt: new Date().toISOString(),
    };
    await db.user.create(userProfile);
    await db.company.create(companyProfile);
    return { status: "ok" };
  } catch (error) {
    console.log("Error", error);
    // throw new Error("User already exists");

    return { status: "error", error: JSON.stringify(error) || "Error" };
  }
}
