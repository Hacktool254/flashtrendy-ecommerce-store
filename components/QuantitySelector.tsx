"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Minus, Plus } from "lucide-react";
import { useState, useEffect } from "react";

interface QuantitySelectorProps {
  min?: number;
  max?: number;
  defaultValue?: number;
  value?: number;
  onQuantityChange?: (quantity: number) => void;
}

export function QuantitySelector({
  min = 1,
  max = 99,
  defaultValue = 1,
  value,
  onQuantityChange,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(value ?? defaultValue);

  // Sync with external value changes
  useEffect(() => {
    if (value !== undefined) {
      setQuantity(value);
    }
  }, [value]);

  const handleDecrease = () => {
    if (quantity > min) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onQuantityChange?.(newQuantity);
    }
  };

  const handleIncrease = () => {
    if (quantity < max) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      onQuantityChange?.(newQuantity);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || min;
    const clampedValue = Math.max(min, Math.min(max, value));
    setQuantity(clampedValue);
    onQuantityChange?.(clampedValue);
  };

  const handleSliderChange = (value: number[]) => {
    const newQuantity = value[0];
    setQuantity(newQuantity);
    onQuantityChange?.(newQuantity);
  };

  return (
    <div className="space-y-4">
      {/* Slider */}
      <div className="space-y-2">
        <Slider
          value={[quantity]}
          onValueChange={handleSliderChange}
          min={min}
          max={max}
          step={1}
          className="w-full"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>

      {/* Buttons and Input */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrease}
          disabled={quantity <= min}
          className="h-10 w-10"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          min={min}
          max={max}
          value={quantity}
          onChange={handleInputChange}
          className="w-20 text-center"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrease}
          disabled={quantity >= max}
          className="h-10 w-10"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

