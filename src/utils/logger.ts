export const logger = {
  debug: (message: string, args?: any) => {
    if (import.meta.env.VITE_APP_ENV === "production") {
      return;
    }
    console.log(message, args);
  },
};
