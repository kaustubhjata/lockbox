
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Shield, Globe, MessageCircle, Upload } from "lucide-react";
import DarkModeToggle from "@/components/DarkModeToggle";

const HeroFeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <Card className="border border-border/40 bg-background/60 backdrop-blur-sm card-hover animate-fade-in">
    <CardHeader className="space-y-1">
      <div className="flex items-center space-x-2">
        <div className="bg-primary/10 p-2 rounded-full">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-sm text-muted-foreground">{description}</CardDescription>
    </CardContent>
  </Card>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 bg-mesh">
      {/* Navigation */}
      <div className="container mx-auto px-4 py-4 flex justify-end">
        <DarkModeToggle className="bg-background/60 hover:bg-background/80" />
      </div>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-12 pb-16 text-center">
        <div className="inline-block mb-6 bg-primary/10 backdrop-blur-sm py-2 px-4 rounded-full">
          <p className="text-sm font-medium text-primary">Secure File Sharing Made Simple</p>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-lockbox-700 to-primary bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
          LockBox Global
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Share encrypted folders with anyone, anywhere with password protection. 
          Your files, your control, globally accessible.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="rounded-full">
            <Link to="/register">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Secure. Simple. Accessible.</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            LockBox Global combines top-tier security with intuitive design, making secure file sharing accessible to everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <HeroFeatureCard 
            icon={Lock}
            title="Password Protected" 
            description="Each folder is encrypted and secured with a password that only you and your recipients know."
          />
          <HeroFeatureCard 
            icon={Globe}
            title="Global Access" 
            description="Access your files from anywhere in the world, on any device, without complex setup."
          />
          <HeroFeatureCard 
            icon={Shield}
            title="Strong Encryption" 
            description="All files are encrypted using industry-standard AES encryption for maximum security."
          />
          <HeroFeatureCard 
            icon={Upload}
            title="Easy File Upload" 
            description="Drag and drop your files to quickly upload them to your secure folders."
          />
          <HeroFeatureCard 
            icon={MessageCircle}
            title="Global Chat" 
            description="Communicate with users and share folder access credentials securely through our chat system."
          />
          <HeroFeatureCard 
            icon={Lock}
            title="User Authentication" 
            description="Secure authentication system to protect your identity and files."
          />
        </div>
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-4 py-16 text-center">
        <Card className="bg-primary text-primary-foreground p-8 mx-auto max-w-4xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Ready to secure your files?</CardTitle>
            <CardDescription className="text-primary-foreground/90 text-lg">
              Join thousands of users who trust LockBox Global with their secure file sharing needs.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button asChild size="lg" variant="secondary" className="text-primary">
              <Link to="/register">Create Account</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-10">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="font-bold text-2xl mb-2">LockBox Global</h3>
            <p className="text-muted-foreground mb-6">Secure File Sharing Platform</p>
            <p className="text-sm text-muted-foreground">© 2025 LockBox Global. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
