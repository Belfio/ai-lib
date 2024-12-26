import { User, LoginForm, UserCompanyProfile } from "@/lib/types";
import db from "@/lib/db";
import { v5 as uuidv5 } from "uuid";
import bcryptjs from "bcryptjs";

type BcryptHash = (
  data: string,
  saltOrRounds: string | number
) => Promise<string>;
type BcryptCompare = (data: string, encrypted: string) => Promise<boolean>;

const { hash, compare } = bcryptjs as {
  hash: BcryptHash;
  compare: BcryptCompare;
};

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
  console.log("process.env.EMAIL_SEED", "66ff3879-74af-48fe-87d0-a8b1cd14963f");
  const hashedEmail = uuidv5(email, "66ff3879-74af-48fe-87d0-a8b1cd14963f");
  console.log("hashedEmail", hashedEmail);
  const user = await db.user.get(hashedEmail);
  if (!user) {
    console.log("no user");
    throw new Error("User not found");
  }
  const isCorrectPassword = await compare(password, user.passwordHash);
  if (!isCorrectPassword) {
    console.log("password incorrect");
    throw new Error("Password incorrect");
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
    console.log(
      "process.env.EMAIL_SEED",
      "66ff3879-74af-48fe-87d0-a8b1cd14963f"
    );
    const hashedEmail = uuidv5(email, process.env.EMAIL_SEED as string);
    const user = await db.user.get(hashedEmail);
    if (user) {
      throw new Error("User already exists");
    }
    console.log(
      "process.env.EMAIL_SEED",
      "66ff3879-74af-48fe-87d0-a8b1cd14963f"
    );
    const hashedName = uuidv5(companyName, process.env.EMAIL_SEED as string);
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
