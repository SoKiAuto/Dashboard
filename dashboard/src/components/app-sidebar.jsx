// src/components/AppSidebar.jsx

"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  ClipboardCheck,
  ActivitySquare,
} from "lucide-react"; // Added icon for CPM
import Link from "next/link";

export function AppSidebar() {
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar();

  const imgSelection = () => {
    if (state === "expanded" || isMobile) {
      return {
        img: "/logo.svg",
        width: 200,
        height: 200,
        p: "p-4",
      };
    } else {
      return {
        img: "/logosmall.svg",
        width: 40,
        height: 40,
      };
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Image
          src={imgSelection().img}
          alt="W! Logo"
          width={imgSelection().width}
          height={imgSelection().height}
          className={clsx("h-auto w-auto", imgSelection().p)}
        />
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard Link */}
              <SidebarMenuItem key="Dashboard">
                <SidebarMenuButton asChild>
                  <Link href="/dashboard" className="flex items-center">
                    <LayoutDashboard />
                    Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Sentinel-VM Link */}
              <SidebarMenuItem key="Sentinel-VM">
                <SidebarMenuButton asChild>
                  <Link href="/vm" className="flex items-center">
                    <ClipboardCheck />
                    Sentinel-VM
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Sentinel-CPM Link */}
              <SidebarMenuItem key="Sentinel-CPM">
                <SidebarMenuButton asChild>
                  <Link href="/cpm" className="flex items-center">
                    <ActivitySquare />
                    Sentinel-CPM
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

               <SidebarMenuItem key="Units">
                <SidebarMenuButton asChild>
                  <Link href="/units" className="flex items-center">
                    <ActivitySquare />
                    Units
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
