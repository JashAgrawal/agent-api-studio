import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    console.log("Password:", password);
    // Check if the password matches the environment variable
    if (password === process.env.APP_SECRET_KEY) {
      console.log("Logging in...");
      // Set a cookie with the secret key
      (await cookies()).set({
        name: "auth-token",
        value: process.env.APP_SECRET_KEY as string,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        // Set expiration to 7 days
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Invalid password" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
