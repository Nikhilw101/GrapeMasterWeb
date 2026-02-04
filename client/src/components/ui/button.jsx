import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 hover:-translate-y-0.5 active:translate-y-0",
                secondary:
                    "bg-white border-2 border-gray-200 text-gray-700 hover:border-green-500 hover:text-green-700",
                outline:
                    "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-11 px-8 py-3",
                sm: "h-9 rounded-lg px-4",
                lg: "h-12 rounded-xl px-10",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
        <Comp
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...props}
        />
    )
})
Button.displayName = "Button"

export { Button, buttonVariants }
