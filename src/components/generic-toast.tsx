import { toaster } from "@kobalte/core";
import { Toast, ToastContent, ToastProgress, ToastTitle } from "./ui/toast";

export function showGenericToast(
  msg: string,
  variant: "default" | "destructive" = "default",
  hasProgressBar = true,
) {
  toaster.show((toastProps) => (
    <Toast toastId={toastProps.toastId} variant={variant ?? "default"}>
      <ToastContent>
        <ToastTitle>{msg}</ToastTitle>
      </ToastContent>
      {hasProgressBar ? <ToastProgress /> : null}
    </Toast>
  ));
}
