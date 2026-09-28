import { BottomSheet, Button, CheckboxTile } from "@analog/ui";
import type { Circle } from "../../data/types";
import styles from "./CirclePickerSheet.module.css";

export interface CirclePickerSheetProps {
  open: boolean;
  onClose: () => void;
  circles: Circle[];
  selected: string[];
  onToggle: (circleId: string, checked: boolean) => void;
}

/** Multi-select list of circles to publish to, beyond the viewer's inner circle. */
export function CirclePickerSheet({ open, onClose, circles, selected, onToggle }: CirclePickerSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Other circles">
      <div className={styles.list}>
        {circles.map((circle) => (
          <CheckboxTile
            key={circle.id}
            label={circle.name}
            checked={selected.includes(circle.id)}
            onChange={(checked) => onToggle(circle.id, checked)}
          />
        ))}
      </div>
      <Button variant="primary" size="lg" fullWidth onClick={onClose}>
        Done
      </Button>
    </BottomSheet>
  );
}
