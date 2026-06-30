import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowRight, Monitor, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

import { MARKETING_MOBILE_PC_DIALOG_PARAM, shouldOpenMarketingMobilePcDialog } from "@/lib/mobileMarketingReturn";
import { OPEN_LIGHT_MOBILE_PC_STUDIO_DIALOG_EVENT } from "./lightDialogEvents";

const DISCORD_INVITE_URL = "https://discord.com/invite/K2EREBJNjd";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 50,
  background: "rgba(17, 17, 20, 0.46)",
} as const;

const contentStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 51,
  boxSizing: "border-box",
  display: "flex",
  width: "calc(100vw - 30px)",
  maxWidth: 345,
  height: "fit-content",
  maxHeight: "calc(100dvh - 30px)",
  margin: "auto",
  flexDirection: "column",
  overflowY: "auto",
  borderRadius: 20,
  background: "#ffffff",
  padding: "24px 16px",
  color: "#111114",
  outline: "none",
  boxShadow: "0 24px 80px rgba(0, 0, 0, 0.18)",
} as const;

const iconTileStyle = {
  display: "flex",
  width: 48,
  height: 48,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 12,
  background: "#f0f1f3",
  color: "#111114",
} as const;

const buttonBaseStyle = {
  display: "flex",
  height: 48,
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
  border: 0,
  borderRadius: 10,
  fontFamily: "Poppins, system-ui, sans-serif",
  fontSize: 15,
  fontWeight: 500,
  cursor: "pointer",
} as const;

export function LightMobilePcStudioDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const showDialog = () => setOpen(true);

    if (shouldOpenMarketingMobilePcDialog(window.location.search)) {
      showDialog();

      const url = new URL(window.location.href);
      url.searchParams.delete(MARKETING_MOBILE_PC_DIALOG_PARAM);
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }

    window.addEventListener(OPEN_LIGHT_MOBILE_PC_STUDIO_DIALOG_EVENT, showDialog);
    return () => {
      window.removeEventListener(OPEN_LIGHT_MOBILE_PC_STUDIO_DIALOG_EVENT, showDialog);
    };
  }, []);

  const handleJoinDiscord = () => {
    window.open(DISCORD_INVITE_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay style={overlayStyle} />
        <DialogPrimitive.Content
          aria-describedby="mobile-pc-studio-description"
          onPointerDownOutside={(event) => event.preventDefault()}
          style={contentStyle}
        >
          <div style={{ display: "flex", height: 48, alignItems: "center", justifyContent: "center", gap: 27 }}>
            <div style={iconTileStyle}>
              <Smartphone aria-hidden size={24} strokeWidth={1.8} />
            </div>
            <ArrowRight aria-hidden size={24} strokeWidth={2} />
            <div style={iconTileStyle}>
              <Monitor aria-hidden size={24} strokeWidth={1.8} />
            </div>
          </div>

          <DialogPrimitive.Title
            style={{
              margin: "24px 0 0",
              textAlign: "center",
              fontFamily: "Poppins, system-ui, sans-serif",
              fontSize: 18,
              fontWeight: 600,
              lineHeight: 1.28,
            }}
          >
            Unlock the Full Studio on PC
          </DialogPrimitive.Title>
          <DialogPrimitive.Description
            id="mobile-pc-studio-description"
            style={{
              margin: "12px 0 0",
              textAlign: "center",
              color: "#555962",
              fontFamily: "Poppins, system-ui, sans-serif",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            Studio-grade orchestration deserves a proper canvas. Switch to PC for the complete VizNow workflow.
          </DialogPrimitive.Description>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
            <button
              type="button"
              onClick={handleJoinDiscord}
              style={{ ...buttonBaseStyle, background: "#111114", color: "#ffffff" }}
            >
              Join Discord
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ ...buttonBaseStyle, background: "#f0f1f3", color: "#555962" }}
            >
              Got it
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
