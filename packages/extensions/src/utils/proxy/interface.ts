export type BeforeInterceptor = <T extends Parameters<typeof fetch>>(...args: T) => any;


export type AfterInterceptor = (res:Response) => any;