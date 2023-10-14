export type Interceptor = <T extends Parameters<typeof fetch>>(...args: T) => any;
