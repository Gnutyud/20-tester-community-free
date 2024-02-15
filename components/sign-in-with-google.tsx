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
// import { AuthError } from "next-auth"
// import { signIn } from "../auth"

// export default function SigninWithGoogle() {
//  return (
//    <form action={async (formData) => {
//      "use server"
//      try {
//        await signIn("credentials", formData)
//     } catch(error) {
//       if (error instanceof AuthError) // Handle auth errors
//       throw error // Rethrow all other errors
//     }
//    }}>
//     <button>Sign in</button>
//   </form>
//  )
// }