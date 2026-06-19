import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import { Button, Popover } from "@analog/ui";
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
      description: "Events, 1-1s, members, map, and food preferences",
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

  function handleMenuItemClick(item: MenuItem) {
    if (item.action) {
      void item.action();
    } else if (item.to) {
      navigate(item.to);
    }
  }

  const menuTrigger = (
    <Button iconOnly aria-label="Member menu" variant="outline">
      <Menu size={20} />
    </Button>
  );

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
        <Popover trigger={menuTrigger} align="end" ariaLabel="Member menu">
          <div role="menu" className={styles.menu}>
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
        </Popover>
      </div>
    </header>
  );
}
