import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    console.log("Login attempt:", { email });
    console.log("Auth URL:", import.meta.env.VITE_AUTH_URL);
    const BASE_URL = 'https://hookbucket-7bk4.vercel.app';
    try {
      // Get CSRF token
      const csrfRes = await fetch(`${BASE_URL}/auth/csrf`, {
        method: "GET",
        credentials: "include",
      });

      const csrfData = await csrfRes.json();
      console.log("CSRF Data:", csrfData);

      // Sign in request
      const payload = {
        email,
        provider: "email",
        csrfToken: csrfData.csrfToken,
        callbackUrl: BASE_URL,
      };
      console.log("Signin Request Payload:", payload);
      console.log("Signin Request URL:", `${BASE_URL}/auth/signin/email`);

      const response = await fetch(`${BASE_URL}/auth/signin/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      console.log("Signin Response:", {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      });

      const data = await response.text();
      console.log("Signin Response Data:", data);

      // Check if response is successful
      if (response.ok) {
        // Try to parse as JSON, but don't fail if it's not JSON
        try {
          const jsonData = JSON.parse(data);
          console.log("Signin Data:", jsonData);
        } catch (e) {
          // Response wasn't JSON, which is fine
          console.log("Non-JSON response received");
        }

        setMessage({
          type: "success",
          text: "Check your email for the login link!",
        });
      } else {
        throw new Error(`Sign in failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to send login link. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Enter your email to receive a login link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {message && (
              <div
                className={`text-sm ${
                  message.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {message.text}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Login Link"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
