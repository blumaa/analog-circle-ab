import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import { Button } from "@analog/ui";
import { dataSource } from "../data";
import { qk, useCurrentMemberId, useMember, useInnerGroup } from "../data/hooks";
import { NotificationBell } from "../components/NotificationBell";
import styles from "./TopBar.module.css";

interface MenuItem {
  label: string;
  description: string;
  /** A route to navigate to, or an action to run. Exactly one is set. */
  to?: string;
  action?: () => void | Promise<void>;
}

/** Top banner: wordmark (Playfair gold) + signed-in name + member menu dropdown. */
export function TopBar() {
  const { data: memberId } = useCurrentMemberId();
  const { data: member } = useMember(memberId ?? "");
  const { data: innerGroup } = useInnerGroup(memberId);
  const firstName = member?.name.split(" ")[0];

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await dataSource.signOut();
    await queryClient.invalidateQueries({ queryKey: qk.currentMember });
    navigate("/innercircle/login");
  }

  const menuItems: MenuItem[] = [
    {
      label: "Your Circle",
      description: "Meetings, 1-1s, members, map, and food preferences",
      to: innerGroup ? `/innercircle/group/${innerGroup.id}` : "/innercircle/dashboard",
    },
    {
      label: "The Square",
      description: "The community calendar",
      to: "/innercircle/calendar",
    },
    {
      label: "The Loop",
      description: "Ask for help and offer what you can",
      to: "/innercircle/the-loop",
    },
    {
      label: "Directory",
      description: "Browse everyone in the community",
      to: "/innercircle/members",
    },
    {
      label: "Your profile",
      description: "Bio, contact details, and group info",
      to: "/innercircle/profile",
    },
    {
      label: "Sign out",
      description: "End your session on this device",
      action: signOut,
    },
  ];

  // Close menu on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  function handleMenuItemClick(item: MenuItem) {
    setOpen(false);
    if (item.action) {
      void item.action();
    } else if (item.to) {
      navigate(item.to);
    }
  }

  return (
    <header className={styles.bar}>
      <h1 className={styles.wordmarkHeading}>
        <Link to="/innercircle/dashboard" className={styles.wordmark}>
          The Analog Circle
        </Link>
      </h1>
      <div className={styles.right}>
        {firstName && <span className={styles.name}>{firstName}</span>}
        <NotificationBell />
        <div className={styles.menuWrapper} ref={wrapperRef}>
          <Button
            iconOnly
            aria-label="Member menu"
            variant="outline"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls="member-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu size={20} />
          </Button>
          {open && (
            <div
              id="member-menu"
              role="menu"
              className={styles.menu}
              aria-label="Member menu"
            >
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  role="menuitem"
                  className={styles.menuItem}
                  onClick={() => handleMenuItemClick(item)}
                >
                  <span className={styles.menuItemLabel}>{item.label}</span>
                  <span className={styles.menuItemDesc}>{item.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
