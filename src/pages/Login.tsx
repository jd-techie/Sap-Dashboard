import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/auth/AuthContext";

const Login = () => {
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [isSignupSubmitting, setIsSignupSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Missing Credentials",
        description: "Email and password are required.",
        variant: "destructive",
      });
      return;
    }

    setIsLoginSubmitting(true);

    const response = await login({ email, password });
    if (response.success) {
      toast({
        title: "Login Successful!",
        description: "You have successfully logged in.",
        variant: "default",
      });
    } else {
      toast({
        title: "Login Failed",
        description: response.message || "Please check your credentials.",
        variant: "destructive",
      });
    }

    setIsLoginSubmitting(false);
  };

  const handleSignup = async () => {
    if (!signupUsername || !signupEmail || !signupPassword) {
      toast({
        title: "Missing Details",
        description: "All sign-up fields are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSignupSubmitting(true);

    const response = await register({
      name: signupUsername,
      email: signupEmail,
      password: signupPassword,
    });

    if (response.success) {
      setIsSignupOpen(false);
      setSignupUsername("");
      setSignupEmail("");
      setSignupPassword("");
      toast({
        title: "Signup Successful!",
        description: response.message || "Your account has been created.",
        variant: "default",
      });
    } else {
      toast({
        title: "Signup Failed",
        description: response.message || "Please try again.",
        variant: "destructive",
      });
    }

    setIsSignupSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Settings className="w-10 h-10 text-sidebar-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-semibold text-foreground">SAP Automation</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void handleLogin();
                }
              }}
            />
          </div>
          <Button onClick={() => void handleLogin()} className="w-full" disabled={isLoginSubmitting}>
            {isLoginSubmitting ? "Signing In..." : "Sign In"}
          </Button>
          <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full" disabled={isSignupSubmitting}>
                Sign Up
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sign Up</DialogTitle>
                <DialogDescription>Create a new account to get started.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="Enter your username"
                    value={signupUsername}
                    onChange={(event) => setSignupUsername(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signupEmail}
                    onChange={(event) => setSignupEmail(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Enter your password"
                    value={signupPassword}
                    onChange={(event) => setSignupPassword(event.target.value)}
                  />
                </div>
                <Button onClick={() => void handleSignup()} className="w-full" disabled={isSignupSubmitting}>
                  {isSignupSubmitting ? "Creating..." : "Sign Up"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
