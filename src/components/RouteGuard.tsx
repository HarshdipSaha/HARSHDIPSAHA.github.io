"use client";

import NotFound from "@/app/not-found";
import { protectedRoutes, routes } from "@/resources";
import { Button, Column, Heading, PasswordInput } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface RouteGuardProps {
  children: React.ReactNode;
}

/**
 * Normalise a pathname to the form used as a key in the `routes` map.
 *
 * Strips a trailing slash and a trailing `.html`, so the guard behaves the same
 * whether the export is served by GitHub Pages (`/about`) or by a plain static
 * file server that exposes the file name (`/about.html`).
 */
function normalisePath(pathname: string | null): string {
  if (!pathname) return "/";
  let p = pathname.replace(/\.html$/, "");
  if (p.length > 1) p = p.replace(/\/$/, "");
  return p || "/";
}

function isRouteEnabled(pathname: string | null): boolean {
  const p = normalisePath(pathname);
  if (p in routes) return routes[p as keyof typeof routes];

  const dynamicRoutes = ["/blog", "/work"] as const;
  for (const route of dynamicRoutes) {
    if (p.startsWith(`${route}/`) && routes[route]) return true;
  }
  return false;
}

/**
 * Gates disabled and password-protected routes.
 *
 * This used to hold every route behind a `loading` state that only cleared in a
 * `useEffect`, so the static export rendered a spinner and nothing else: all
 * page content lived in the client payload, invisible to crawlers and to any
 * client whose JS had not run. Route enablement is a pure function of the
 * static `routes` map, so it is computed during render instead, and children
 * are emitted into the prerendered HTML.
 *
 * The password branch is the only genuinely asynchronous case, and it is
 * engaged only for routes that are actually listed in `protectedRoutes`.
 * Note that it calls `/api/*`, which cannot exist under `output: "export"` —
 * `protectedRoutes` is empty, and enabling one would need a real backend.
 */
const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const enabled = isRouteEnabled(pathname);
  const requiresPassword = Boolean(
    protectedRoutes[normalisePath(pathname) as keyof typeof protectedRoutes],
  );

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!requiresPassword) return;
    let cancelled = false;
    fetch("/api/check-auth")
      .then((response) => {
        if (!cancelled && response.ok) setIsAuthenticated(true);
      })
      .catch(() => {
        /* no backend under static export; stays unauthenticated */
      });
    return () => {
      cancelled = true;
    };
  }, [requiresPassword]);

  const handlePasswordSubmit = async () => {
    try {
      const response = await fetch("/api/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        setIsAuthenticated(true);
        setError(undefined);
      } else {
        setError("Incorrect password");
      }
    } catch {
      setError("Authentication is unavailable");
    }
  };

  if (!enabled) {
    return <NotFound />;
  }

  if (requiresPassword && !isAuthenticated) {
    return (
      <Column paddingY="128" maxWidth={24} gap="24" center>
        <Heading align="center" wrap="balance">
          This page is password protected
        </Heading>
        <Column fillWidth gap="8" horizontal="center">
          <PasswordInput
            id="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            errorMessage={error}
          />
          <Button onClick={handlePasswordSubmit}>Submit</Button>
        </Column>
      </Column>
    );
  }

  return <>{children}</>;
};

export { RouteGuard };
