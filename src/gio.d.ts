declare namespace Gio {
    export interface File {
        new_for_path(path: string): File;
        get_uri(): string;
    }

    export interface Settings {
        get_value(key: string): GLib.Variant;
        set_value(key: string, value: GLib.Variant): boolean;
        set_string(key: string, value: string): boolean;
        sync(): void;
    }
}

declare namespace GLib {
    export class Variant {
        constructor(type: string, value: any);
        deepUnpack(): any;
    }
}
