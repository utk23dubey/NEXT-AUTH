import AuthForm from "@/components/auth-form";

export default async function Home({ searchParams }) {
  const mode = searchParams.mode || "login";
  return <AuthForm mode={mode} />;
}
