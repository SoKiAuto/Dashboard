"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function BackToCPMButton() {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push("/vm")}
      variant="secondary"
      className="flex items-center gap-2"
    >
      <ArrowLeft size={18} />
      Back to VM Dashboard
    </Button>
  );
}
