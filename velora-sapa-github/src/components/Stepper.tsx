"use client";

import { useId } from "react";

/** Bộ tăng giảm số lượng. Nút + bị khóa khi chạm giới hạn, kèm lý do đọc được bằng trình đọc màn hình. */
export default function Stepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
  maxReason,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  maxReason?: string;
}) {
  const id = useId();
  const atMax = value >= max;
  return (
    <div className="field" role="group" aria-labelledby={`${id}-l`} aria-describedby={hint ? `${id}-h` : undefined}>
      <span className="label" id={`${id}-l`}>
        {label}
        {hint && (
          <span id={`${id}-h`} className="hint">
            {" "}
            ({hint})
          </span>
        )}
      </span>
      <div className="stepper">
        <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`${label}: −1`}>
          −
        </button>
        <output aria-live="polite">{value}</output>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          disabled={atMax}
          aria-label={`${label}: +1`}
          title={atMax ? maxReason : undefined}
        >
          +
        </button>
      </div>
    </div>
  );
}
