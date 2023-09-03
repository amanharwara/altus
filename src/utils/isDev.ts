// @ts-expect-error - import.meta.env works fine but TS throws an error
export const isDev = import.meta.env.DEV;
