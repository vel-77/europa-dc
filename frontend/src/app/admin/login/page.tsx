import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/api";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  if (await isSignedIn()) redirect("/admin");
  return (
    <main className="admin-login">
      <h1>Europa DC admin</h1>
      <LoginForm />
    </main>
  );
}
