import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { loginUser, registerUser } from "../common/ServerAPI"; // Import API functions
import { toast } from "@/components/ui/use-toast"; // Import toast

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignupOpen, setIsSignupOpen] = useState(false);
    const [signupUsername, setSignupUsername] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");

    const handleLogin = async () => {
        const response = await loginUser({ email, password });
        if (response.success) {
            navigate("/");
            toast({
                title: "Login Successful!",
                description: "You have successfully logged in.",
                variant: "default",
            });
        } else {
            console.error("Login failed:", response.message);
            toast({
                title: "Login Failed",
                description: response.message || "Please check your credentials.",
                variant: "destructive",
            });
        }
    };

    const handleSignup = async () => {
        const response = await registerUser({ name: signupUsername, email: signupEmail, password: signupPassword });
        if (response.success) {
            console.log("Signup successful:", response);
            setIsSignupOpen(false);
            setSignupUsername("");
            setSignupEmail("");
            setSignupPassword("");
            toast({
                title: "Signup Successful!",
                description: "Your account has been created.",
                variant: "default",
            });
        } else {
            console.error("Signup failed:", response.message);
            toast({
                title: "Signup Failed",
                description: response.message || "Please try again.",
                variant: "destructive",
            });
        }
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
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleLogin} className="w-full">
                        Sign In
                    </Button>
                    <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                                Sign Up
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Sign Up</DialogTitle>
                                <DialogDescription>
                                    Create a new account to get started.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signup-username">Username</Label>
                                    <Input
                                        id="signup-username"
                                        type="text"
                                        placeholder="Enter your username"
                                        value={signupUsername}
                                        onChange={(e) => setSignupUsername(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <Input
                                        id="signup-email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={signupEmail}
                                        onChange={(e) => setSignupEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password">Password</Label>
                                    <Input
                                        id="signup-password"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={signupPassword}
                                        onChange={(e) => setSignupPassword(e.target.value)}
                                    />
                                </div>
                                <Button onClick={handleSignup} className="w-full">
                                    Sign Up
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

