import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import { ToastList, ToastRegion } from "./components/ui/toast";
import { AppHeader } from "./components/app-header";
import { AppFooter } from "./components/app-footer";

export default function App() {
  return (
    <Router
      root={props => (
        <>
          <Suspense>
						<AppHeader />
            {props.children}
						<AppFooter />
            <ToastRegion>
              <ToastList />
            </ToastRegion>
          </Suspense>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
