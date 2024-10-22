import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import { MetaProvider } from "@solidjs/meta";
import { AppFooter } from "./components/app-footer";
import { AppHeader } from "./components/app-header";
import { ToastList, ToastRegion } from "./components/ui/toast";
import { SocialMeta } from "./components/social-meta";
import { inject } from "@vercel/analytics";
import { injectSpeedInsights } from "@vercel/speed-insights"

inject();
injectSpeedInsights()

export default function App() {
  return (
    <Router
      root={(props) => (
        <>
          <MetaProvider>
            <SocialMeta />
            <Suspense>
              <AppHeader />
              {props.children}
              <AppFooter />
              <ToastRegion>
                <ToastList />
              </ToastRegion>
            </Suspense>
          </MetaProvider>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
