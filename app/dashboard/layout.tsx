"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { 
  LayoutDashboard, 
  Mic, 
  History, 
  FileText, 
  Settings,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "New Interview", href: "/dashboard/interview", icon: Mic },
  { name: "History", href: "/dashboard/history", icon: History },
  { name: "Resume Analyzer", href: "/dashboard/resume", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    firstName: "Alex",
    lastName: "Johnson",
    role: "Student"
  });

  useEffect(() => {
    // Load user profile from localStorage
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setUserProfile({
          firstName: profile.firstName || "Alex",
          lastName: profile.lastName || "Johnson",
          role: profile.role || "Student"
        });
      } catch (e) {
        console.error("Error loading profile:", e);
      }
    }

    // Listen for storage changes to update profile when settings change
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userProfile" && e.newValue) {
        try {
          const profile = JSON.parse(e.newValue);
          setUserProfile({
            firstName: profile.firstName || "Alex",
            lastName: profile.lastName || "Johnson",
            role: profile.role || "Student"
          });
        } catch (err) {
          console.error("Error parsing profile:", err);
        }
      }
    };

    // Also listen for custom events (for same-tab updates)
    const handleProfileUpdate = () => {
      const savedProfile = localStorage.getItem("userProfile");
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          setUserProfile({
            firstName: profile.firstName || "Alex",
            lastName: profile.lastName || "Johnson",
            role: profile.role || "Student"
          });
        } catch (e) {
          console.error("Error loading profile:", e);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-white dark:bg-gray-950 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <Mic className="w-8 h-8 text-primary" />
            <span className="ml-2 text-xl font-bold">InterviewerAI</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          pathname === item.href
                            ? "bg-primary text-white"
                            : "text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800",
                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors"
                        )}
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="flex items-center gap-x-4 p-2 border-t pt-4">
                  <UserButton afterSignOutUrl="/" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {userProfile.firstName} {userProfile.lastName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {userProfile.role}
                    </span>
                  </div>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-white dark:bg-gray-950 px-4 shadow-sm sm:gap-x-6 sm:px-6">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-2">
              <Mic className="w-6 h-6 text-primary" />
              <span className="font-bold">InterviewerAI</span>
            </div>
            <div className="ml-auto flex items-center gap-x-4">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-gray-900/80 backdrop-blur-sm lg:hidden">
            <div className="fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto bg-white dark:bg-gray-950 px-6 pb-4">
              <div className="flex h-16 shrink-0 items-center">
                <Mic className="w-8 h-8 text-primary" />
                <span className="ml-2 text-xl font-bold">InterviewerAI</span>
              </div>
              <nav className="mt-5">
                <ul role="list" className="space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          pathname === item.href
                            ? "bg-primary text-white"
                            : "text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800",
                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                        )}
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
