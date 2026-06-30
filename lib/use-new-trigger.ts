"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * If the URL contains `?new=1`, fire the callback (typically `setCreateOpen(true)`)
 * and strip the param so a reload doesn't re-trigger it.
 *
 * Used to let the command palette open create dialogs by navigating to
 * `/clients?new=1`, `/projects?new=1`, etc.
 */
export function useNewTrigger(open: () => void) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      open();
      router.replace(pathname, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
}
