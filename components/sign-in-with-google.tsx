"use client";

import { authenticate } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";

export default function SigninWithGoogle() {
  return (
    <Button
      onClick={authenticate}
      className="mt-6"
      variant="secondary"
    >
      Login with Google <Chrome className="w-4 h-4 ml-4" />
    </Button>
  );
}
