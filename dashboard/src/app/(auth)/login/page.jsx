"use client";
import "@/app/globals.css";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeToggle } from "@/components/modeToggle";
import { User, Lock, Key } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ThemeProvider } from "@/components/theme-provider";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (res.ok) {
      router.push("/");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} antialiased`}>
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-background px-4 py-6">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {/* Toggle in top right */}
            <div className="absolute top-4 right-4">
              <ModeToggle />
            </div>

            <div className="flex flex-col lg:flex-row w-full max-w-5xl bg-card shadow-md rounded-lg overflow-hidden">
              {/* Left Card */}
              <Card className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6">
                <CardContent className="flex flex-col items-center text-center gap-4">
                  <img
                    src="/logo.svg"
                    alt="W! Logo"
                    className="w-32 sm:w-40 lg:w-48 mb-4 border border-gray-300"
                  />
                  <h1 className="text-3xl font-bold">Welcome</h1>
                  <p className="text-base text-muted-foreground">
                    Please login to continue.
                  </p>
                </CardContent>
              </Card>

              {/* Right Card */}
              <Card className="w-full lg:w-1/2 p-6">
                <CardHeader className="text-left">
                  <CardTitle className="text-2xl">Login</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="username" className="mb-2">
                        Username
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-10 w-10 p-2 border rounded-md" />
                        <Input
                          id="username"
                          type="text"
                          placeholder="Username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="h-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="password" className="mb-2">
                        Password
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Lock className="h-10 w-10 p-2 border rounded-md" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-10"
                          required
                        />
                      </div>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <Button
                      type="submit"
                      className="w-full h-12 font-bold text-lg"
                    >
                      <Key className="mr-2" /> Sign In
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
