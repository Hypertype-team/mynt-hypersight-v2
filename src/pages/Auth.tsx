import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [email, setEmail] = useState("johan.wikstrom@greenely.se");
  const [password, setPassword] = useState("greenely20hypersight");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Only allow specific credentials for sign in
      if (
        email === "johan.wikstrom@greenely.se" &&
        password === "greenely20hypersight"
      ) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in.",
        });
        navigate("/");
      } else {
        throw new Error("Invalid credentials. Please use the provided test account.");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F0FB]">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-2xl shadow-lg border border-[#E5DEFF]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#2D2D2D]">Welcome Back</h2>
          <p className="text-[#6B7280] mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#4A4A4A]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="bg-[#F8F7FF] border-[#E5DEFF] text-[#2D2D2D] placeholder:text-[#9CA3AF] focus-visible:ring-[#9b87f5]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#4A4A4A]">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="bg-[#F8F7FF] border-[#E5DEFF] text-[#2D2D2D] placeholder:text-[#9CA3AF] focus-visible:ring-[#9b87f5]"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#9b87f5] hover:bg-[#8875e0] text-white transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Auth;