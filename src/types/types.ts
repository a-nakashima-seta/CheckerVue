export interface CheckItem {
    id: string;
    label: string;
    checkFn: (pageSource: string, ...args: any[]) => string | null | undefined | Promise<string | null | undefined | string[]>;
}
