"use client";

import * as React from "react";
import { clsx } from "clsx";

export function ToggleGroup({ value = [], onValueChange, children, className, type = "multiple" }) {
  const handleToggle = (val) => {
    if (type === "multiple") {
      onValueChange(
        value.includes(val) ? value.filter((v) => v !== val) : [...value, val]
      );
    } else {
      onValueChange([val]);
    }
  };

  return (
    <div className={clsx("flex flex-wrap gap-2", className)}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          isActive: value.includes(child.props.value),
          onToggle: () => handleToggle(child.props.value),
        })
      )}
    </div>
  );
}

export function ToggleGroupItem({ value, children, isActive, onToggle, className }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={clsx(
        "px-3 py-1 text-sm rounded-md transition-colors border",
        "bg-muted text-muted-foreground border-border",
        {
          "bg-primary text-primary-foreground shadow ring-1 ring-ring": isActive,
          "hover:bg-accent hover:text-accent-foreground": !isActive,
        },
        className
      )}
    >
      {children}
    </button>
  );
}
