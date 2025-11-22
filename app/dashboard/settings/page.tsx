"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [firstName, setFirstName] = useState("Alex");
  const [lastName, setLastName] = useState("Johnson");
  const [role, setRole] = useState("Student");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved preferences
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setFirstName(profile.firstName || "Alex");
        setLastName(profile.lastName || "Johnson");
        setRole(profile.role || "Student");
      } catch (e) {
        console.error("Error loading profile:", e);
      }
    }
    
    const savedEmailPref = localStorage.getItem("emailNotifications");
    if (savedEmailPref !== null) {
      setEmailNotifications(savedEmailPref === "true");
    }
    
    const savedAutoSave = localStorage.getItem("autoSave");
    if (savedAutoSave !== null) {
      setAutoSave(savedAutoSave === "true");
    }
  }, []);

  const handleSaveChanges = () => {
    setIsSaving(true);
    // Save to localStorage or API
    localStorage.setItem("userProfile", JSON.stringify({
      firstName,
      lastName,
      role,
    }));
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event("profileUpdated"));
    
    setTimeout(() => {
      setIsSaving(false);
      alert("Profile updated successfully!");
    }, 1000);
  };

  const handleExportData = () => {
    const interviews = localStorage.getItem("interviews") || "[]";
    const userProfile = localStorage.getItem("userProfile") || "{}";
    const exportData = {
      profile: JSON.parse(userProfile),
      interviews: JSON.parse(interviews),
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      // Clear all data
      localStorage.clear();
      alert("Account data cleared. You'll be signed out.");
      window.location.href = "/";
    }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>AJ</AvatarFallback>
            </Avatar>
            <div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => alert("Photo upload feature coming soon! For now, use Clerk's user profile settings.")}
              >
                Change Photo
              </Button>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF (max 2MB)</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="alex.johnson@email.com" disabled />
            <p className="text-xs text-muted-foreground">
              Email is managed by your authentication provider
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Current Role</Label>
            <Input 
              id="role" 
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your interview experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive email summaries of your practice sessions
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setEmailNotifications(!emailNotifications);
                localStorage.setItem("emailNotifications", String(!emailNotifications));
              }}
            >
              {emailNotifications ? "Enabled" : "Disabled"}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-save Sessions</p>
              <p className="text-sm text-muted-foreground">
                Automatically save your interview progress
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setAutoSave(!autoSave);
                localStorage.setItem("autoSave", String(!autoSave));
              }}
            >
              {autoSave ? "Enabled" : "Disabled"}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark theme
              </p>
            </div>
            {mounted && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                <span className="ml-2">Toggle</span>
              </Button>
            )}
            {!mounted && (
              <Button variant="outline" size="sm" disabled>
                <span className="ml-2">Loading...</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Management */}
      <Card>
        <CardHeader>
          <CardTitle>Account Management</CardTitle>
          <CardDescription>Manage your account security and data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Authentication</p>
              <p className="text-sm text-muted-foreground">
                Manage your login methods and security
              </p>
            </div>
            <div>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Download Data</p>
              <p className="text-sm text-muted-foreground">
                Export all your interview data and results
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExportData}
            >
              Export
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Button 
              variant="destructive"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
