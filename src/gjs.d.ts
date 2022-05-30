/* Make the transpiler happy working with Shell global vars
/*  -------------------------------------------------- */
declare const global: Global;
declare const _: (args: string) => string;

declare function log(msg: string): void;

interface Global {
    display: Meta.Display;
}

declare namespace imports {
    const gi: any;

    export class misc {
        static extensionUtils: ExtensionUtils;
    }

    export class Metadata {
        name: string;
    }

    export interface ExtensionUtils {
        getCurrentExtension(): Extension;
        getSettings(path: string): Gio.Settings;
    }

    export interface Extension {
        dir: any;
        enable(): void;
        disable(): void;
        metadata: Metadata;
    }
}
/* -------------------------------------------------- */

declare namespace GDesktopEnums {
    enum BackgroundStyle {
        NONE = 0,
        WALLPAPER = 1,
        CENTERED = 2,
        SCALED = 3,
        STRETCHED = 4,
        ZOOM = 5,
        SPANNED = 6,
    }
}

declare namespace GObject {
    type SignalID = number;
    interface Object {
        connect(signal: string, callback: (...args: any[]) => boolean | void): SignalID;
        disconnect(id: SignalID): void;

        ref(): this;
        unref(): void;
    }
    function registerClass({}, {}): any;
}

declare namespace GLib {
    enum SeekType {
        CUR = 0,
        SET = 1,
        END = 2,
    }
}
