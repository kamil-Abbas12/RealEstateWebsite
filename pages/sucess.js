import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;

  useEffect(() => {
    if (session_id) {
      router.push("/dashboard");
    }
  }, [session_id]);

  return <h2>Payment successful! Redirecting...</h2>;
}
