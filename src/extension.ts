const extensionUtils = imports.misc.extensionUtils;
//@ts-ignore: Used for import after transpilation
const Me: imports.Extension = extensionUtils.getCurrentExtension();

const { Gio, Meta } = imports.gi;

import * as pm from "profileManager";
import * as sp from "swapperProfile";

const EXTENSION_SETTINGS = "org.gnome.shell.extensions.background-swapper";
const DESKTOP_SETTINGS = "org.gnome.desktop.background";

class Extension {
    private _aspectRatio!: string | null;
    private _monitorManager!: Meta.MonitorManager | null;
    private _connectedSignalIds!: GObject.SignalID[] | null;

    constructor() {}

    enable(): void {
        log(`enabling ${Me.metadata.name}`);
        this._connectedSignalIds = [];
        this._monitorManager = Meta.get_backend().get_monitor_manager();
        const display: Meta.Display = global.display;
        const size: [number, number] = display.get_size();
        this.setAspectRatio(size);
        this._connectedSignalIds.push(
            this._monitorManager!.connect("monitors-changed", this.monitorsChanged.bind(this))
        );
        this._connectedSignalIds.push(
            this._monitorManager!.connect(
                "monitors-changed-internal",
                this.monitorsChanged.bind(this)
            )
        );
        this.monitorsChanged();
    }

    disable(): void {
        log(`disabling ${Me.metadata.name}`);
        this._connectedSignalIds!.forEach((sigId) => {
            this._monitorManager!.disconnect(sigId);
        });
        this._aspectRatio = null;
        this._monitorManager = null;
        this._connectedSignalIds = null;
    }

    setAspectRatio(size: [number, number]): void {
        this._aspectRatio = this.getAspectRatio(size);
    }

    getAspectRatio(size: [number, number]): string {
        //Reduce Fraction
        const findGcd = (x: number, y: number): number => {
            return y ? findGcd(y, x % y) : x;
        };
        const gcd = findGcd(size[0], size[1]);
        const widthRatio: number = size[0] / gcd;
        const heightRatio: number = size[1] / gcd;
        return widthRatio.toString() + ":" + heightRatio.toString();
    }

    monitorsChanged(): void {
        const display: Meta.Display = global.display;
        const size: [number, number] = display.get_size();
        const newAspectRatio = this.getAspectRatio(size);

        if (newAspectRatio == this._aspectRatio) {
            return;
        }
        this._aspectRatio = newAspectRatio;
        const profile: sp.SwapperProfile | undefined = this.findProfile();
        if (typeof profile === "undefined") {
            log("No profile found for aspect ratio: " + this._aspectRatio);
            return;
        }
        log("Swapping to profile for aspect ratio: " + this._aspectRatio);
        this.applyProfile(profile);
    }

    findProfile(): sp.SwapperProfile | undefined {
        const profileManager = new pm.ProfileManager(
            extensionUtils.getSettings(EXTENSION_SETTINGS)
        );
        return profileManager.getProfileForRatio(this._aspectRatio!);
    }

    applyProfile(profile: sp.SwapperProfile): void {
        try {
            const backgroundSettings: Gio.Settings = extensionUtils.getSettings(DESKTOP_SETTINGS);

            //TODO - Implement Ability to set different backgrounds for Light/Dark color-schemes
            backgroundSettings.set_string("picture-uri", profile.getBackgroundPath());
            backgroundSettings.set_string("picture-uri-dark", profile.getBackgroundPath());
            backgroundSettings.set_string(
                "picture-options",
                profile.getBackgroundStyleAsString().toLowerCase()
            );
            Gio.Settings.sync();
        } catch (e) {
            log("Failed to apply profile for aspect ratio " + this._aspectRatio + ` ERROR:\n${e}`);
        }
    }
}

//@ts-ignore: Called by GNOME Shell
function init(): Extension {
    log(`initializing ${Me.metadata.name}`);

    return new Extension();
}
