import * as Sentry from "@sentry/react";

export const logger = {
  debug: (message?: any, ...optionalParams: any[]) => {
    if (import.meta.env.VITE_APP_ENV === "production") {
      return;
    }
    console.log(message, ...optionalParams);
  },
};

export const captureSentryError = (error: any, walletAddress?: string) => {
  const errorMessage = error?.response?.data?.message || error?.message;

  const errorToCapture =
    error instanceof Error ? error : new Error(errorMessage);

  Sentry.captureException(errorToCapture, {
    extra: {
      originalError: error,
      walletAddress,
    },
  });
};
