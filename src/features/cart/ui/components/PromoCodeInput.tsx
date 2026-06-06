"use client";

import { useState } from "react";
import { cartTheme } from "@/theme/components";
import { Input } from "@/features/ui/input";
import { Button } from "@/features/ui/button";

export function PromoCodeInput() {
  const [code, setCode] = useState("");

  return (
    <div className={cartTheme.promo.container}>
      <div className={cartTheme.promo.row}>
        <Input
          type="text"
          placeholder="PROMO CODE"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className={cartTheme.promo.input}
        />
        <Button
          variant="outline"
          onClick={() => {}}
          aria-label="Apply promo code"
          className={cartTheme.promo.button}
        >
          APPLY
        </Button>
      </div>
    </div>
  );
}
