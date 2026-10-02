import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin | Europa DC",
  robots: { index: false, follow: false },
};

export default function AdminRoot({ children }: LayoutProps<"/admin">) {
  return <div className="admin">{children}</div>;
}
