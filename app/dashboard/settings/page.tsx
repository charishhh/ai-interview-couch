"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserButton } from "@clerk/nextjs";

export default function SettingsPage() {
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
              <Button variant="outline" size="sm">Change Photo</Button>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF (max 2MB)</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" defaultValue="Alex" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" defaultValue="Johnson" />
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
            <Input id="role" defaultValue="Student" />
          </div>

          <Button>Save Changes</Button>
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
            <Button variant="outline" size="sm">
              Enabled
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-save Sessions</p>
              <p className="text-sm text-muted-foreground">
                Automatically save your interview progress
              </p>
            </div>
            <Button variant="outline" size="sm">
              Enabled
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark theme
              </p>
            </div>
            <Button variant="outline" size="sm">
              Toggle
            </Button>
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
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Button variant="destructive">Delete Account</Button>
            <p className="text-xs text-muted-foreground mt-2">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
