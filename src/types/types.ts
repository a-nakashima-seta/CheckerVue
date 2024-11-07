export interface CheckItem {
    id: string;
    label: string;
    checkFn: (pageSource: string) => string | null | undefined | Promise<string | null | undefined | string[]>;
}
