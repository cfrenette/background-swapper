declare namespace Meta {
    export function get_backend(): Backend;

    interface Backend extends GObject.Object {
        get_monitor_manager(): MonitorManager;
    }

    interface Background extends GObject.Object {
        set_file(file: Gio.File, style: GDesktopEnums.BackgroundStyle): void;
    }

    interface Display extends GObject.Object {
        get_size(): [number, number];
    }

    interface MonitorManager extends GObject.Object {}
}
