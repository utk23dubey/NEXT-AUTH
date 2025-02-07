"use server";

import { createAuthSession, removeSession } from "@/lib/auth";
import { hashUserPassword, verifyPassword } from "@/lib/hash";
import { createUser, getUser } from "@/lib/users";
import { redirect } from "next/navigation";

export async function signup(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  let errors = {};

  if (!email.includes("@")) {
    errors.email = "Please enter a valid email address";
  }
  if (password.trim().length < 8) {
    errors.password = "Password must be greater than 8 digits";
  }

  if (Object.keys(errors).length > 0) {
    return { errors }; // should always return an object as FormState defined in component needs an object
  }

  const hashedPassword = hashUserPassword(password);

  const user = {
    email,
    password: hashedPassword,
  };

  console.log(user);
  try {
    const user_id = await createUser(email, hashedPassword);
    console.log(user_id);
    await createAuthSession(user_id);
    redirect("/training");
  } catch (error) {
    if (/unique/i.test(error.code)) {
      return {
        errors: {
          email: "Email Id already exist , Use new one",
        },
      };
    }
    throw error;
  }
}

export async function login(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  console.log("form", formData, email);
  const existingUser = await getUser(email);

  if (!existingUser) {
    return {
      errors: {
        email: "User Not Found,Please check your credentials",
      },
    };
  }

  console.log(existingUser);

  const validatePassword = await verifyPassword(
    existingUser.password,
    password
  );

  if (!validatePassword) {
    return {
      errors: {
        password:
          "User Not Found,Please check your credentials,Password mismatch",
      },
    };
  }

  await createAuthSession(existingUser.id);
  redirect("/training");
}

export async function auth(mode, prevState, formData) {
  console.log(mode, formData);
  if (mode == "signup") {
    return signup(prevState, formData);
  }

  return login(prevState, formData);
}

export async function logout() {
  await removeSession();
  redirect("/");
}
