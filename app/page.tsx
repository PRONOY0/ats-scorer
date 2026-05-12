import GoogleAuthButton from "@/components/AuthButton";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <GoogleAuthButton />
      <p className="text-4xl">hello user</p>
    </div>
  );
}
