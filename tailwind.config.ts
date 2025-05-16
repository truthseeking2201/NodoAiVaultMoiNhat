import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      colors: {
        // Background and UI colors
        "background-color": "#0B0C10",
        "card-background": "#121620",
        "text-primary": "#E5E7EB",
        "text-secondary": "#9CA3AF",

        ai: {
          DEFAULT: "#FDEBCF",
          light: "#FDEBCF",
          dark: "#0A080E",
        },
        red: {
          error: "#FF8077",
        },
        yellow: {
          warning: "#FFA822",
        },
        toast: {
          default: "#242C32",
        },

        // Brand color aliases
        brand: {
          "50": "rgba(236, 111, 5, .25)",
          "400": "#FF9320", // nova light
          "500": "#EC6F05", // nova default
          "600": "#B45004", // nova dark
          "700": "#5A2702", // nova deep
        },

        // shadcn UI colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      boxShadow: {
        // Standardized shadow system
        "neon-nova": "0 0 20px rgba(236, 111, 5, 0.18)",
        "neon-orion": "0 0 20px rgba(245, 158, 11, 0.18)",
        "neon-emerald": "0 0 20px rgba(16, 185, 129, 0.18)",
        "neon-violet": "0 0 20px rgba(62, 22, 114, 0.18)",
        brand: "0 4px 8px -2px rgba(236, 111, 5, .35)",
        "brand-hover": "0 8px 16px -8px rgba(236, 111, 5, .25)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.12)",

        // Standard elevation system
        "elevation-1": "0 1px 3px rgba(0, 0, 0, 0.2)",
        "elevation-2": "0 4px 6px rgba(0, 0, 0, 0.2)",
        "elevation-3": "0 10px 15px rgba(0, 0, 0, 0.2)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-brand":
          "linear-gradient(90deg, #FF9320 0%, #EC6F05 50%, #B45004 100%)",
        "gradient-brand-vertical":
          "linear-gradient(180deg, #FF9320 0%, #EC6F05 50%, #B45004 100%)",
        "gradient-glow":
          "radial-gradient(circle closest-side, var(--tw-gradient-stops))",
        "gradient-button":
          "linear-gradient(90deg, #0090FF -29.91%, #FF6D9C 44.08%, #FB7E16 100%)",
      },
      borderRadius: {
        none: "0",
        sm: "0.25rem", // 4px
        md: "0.5rem", // 8px
        lg: "0.75rem", // 12px
        xl: "1rem", // 16px
        "2xl": "1.5rem", // 24px
        "3xl": "2rem", // 32px
        full: "9999px",
      },
      backdropBlur: {
        glass: "20px",
      },
      transitionDuration: {
        "250": "250ms",
        "300": "300ms",
        "400": "400ms",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.25, 0.1, 0.25, 1)", // Standard ease-out
        emphasis: "cubic-bezier(0.175, 0.885, 0.32, 1.275)", // Elastic
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "-500px 0" },
          "100%": { backgroundPosition: "500px 0" },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-out": {
          "0%": {
            opacity: "1",
            transform: "translateY(0)",
          },
          "100%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
        },
        "scale-in": {
          "0%": {
            transform: "scale(0.95)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
        "hover-scale": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(0.98)" },
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: "0.6",
            transform: "scale(0.95)",
          },
          "50%": {
            opacity: "1",
            transform: "scale(1.05)",
          },
        },
        "pulse-slow": {
          "0%, 100%": {
            boxShadow: "0 0 15px rgba(255, 168, 34, 0.6)",
            transform: "scale(1)",
          },
          "50%": {
            boxShadow: "0 0 30px rgba(255, 168, 34, 0.8)",
            transform: "scale(1.05)",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-5px)",
          },
        },
      },
      animation: {
        "accordion-down":
          "accordion-down 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
        "accordion-up": "accordion-up 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
        shimmer: "shimmer 2s linear infinite",
        "fade-in": "fade-in 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards",
        "fade-out": "fade-out 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards",
        "scale-in": "scale-in 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
        "hover-scale": "hover-scale 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)",
        "slow-spin": "spin 4s linear infinite",
        pulse: "pulse 2s cubic-bezier(0.25, 0.1, 0.25, 1) infinite",
        "pulse-glow": "pulse-glow 3s cubic-bezier(0.25, 0.1, 0.25, 1) infinite",
        "pulse-slow": "pulse-slow 3s cubic-bezier(0.25, 0.1, 0.25, 1) infinite",
        float: "float 4s cubic-bezier(0.25, 0.1, 0.25, 1) infinite",
      },
      spacing: {
        // Standard spacing scale
        xs: "0.25rem", // 4px
        sm: "0.5rem", // 8px
        md: "1rem", // 16px
        lg: "1.5rem", // 24px
        xl: "2rem", // 32px
        "2xl": "2.5rem", // 40px
        "3xl": "3rem", // 48px
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
