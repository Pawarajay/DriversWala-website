import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface PlacesAutocompleteInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    isLoaded: boolean;
    leftNode?: React.ReactNode;
    rightNode?: React.ReactNode;
}

const PlacesAutocompleteInput = ({
    value,
    onChange,
    placeholder = "Enter address",
    className = "",
    isLoaded,
    leftNode,
    rightNode,
}: PlacesAutocompleteInputProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    useEffect(() => {
        if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
            componentRestrictions: { country: "in" },
            fields: ["formatted_address", "name", "geometry"],
            types: ["geocode", "establishment"],
        });

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place?.formatted_address) {
                onChange(place.formatted_address);
            } else if (place?.name) {
                onChange(place.name);
            }
        });

        autocompleteRef.current = autocomplete;
    }, [isLoaded, onChange]);

    // Keep the input value in sync when the parent resets the form
    const prevValueRef = useRef(value);
    useEffect(() => {
        if (
            inputRef.current &&
            prevValueRef.current !== value &&
            value === ""
        ) {
            inputRef.current.value = "";
        }
        prevValueRef.current = value;
    }, [value]);

    return (
        <div className="relative flex items-center w-full">
            {leftNode && (
                <div className="absolute left-4 z-10 flex items-center justify-center pointer-events-none">
                    {leftNode}
                </div>
            )}
            <input
                ref={inputRef}
                defaultValue={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={cn(
                    "flex h-12 w-full rounded-xl bg-transparent px-3 py-2 text-[15px] placeholder:text-muted-foreground focus:outline-none outline-none disabled:cursor-not-allowed disabled:opacity-50",
                    leftNode && "pl-10",
                    rightNode && "pr-12",
                    className
                )}
                autoComplete="off"
            />
            {rightNode && (
                <div className="absolute right-4 z-10 flex items-center justify-center pointer-events-none">
                    {rightNode}
                </div>
            )}
        </div>
    );
};

export default PlacesAutocompleteInput;
