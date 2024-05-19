import Gio from 'gi://Gio';
import Shell from 'gi://Shell';
import Meta from 'gi://Meta';
//@ts-ignore: GJS
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

import { SwapperProfile } from "./swapperProfile.js";
import { ProfileManager } from "./profileManager.js";

const EXTENSION_SETTINGS = "org.gnome.shell.extensions.background-swapper";
const DESKTOP_SETTINGS = "org.gnome.desktop.background";

export default class BackgroundSwapper extends Extension {
    private _gsettings?: Gio.Settings;
    private _aspectRatio!: string | null;
    private _monitorManager!: Meta.MonitorManager | null;
    private _connectedSignalIds!: number[] | null;

    public enable(): void {
        log(`enabling ${this.metadata.name}`);
        this._gsettings = this.getSettings(EXTENSION_SETTINGS);
        this._connectedSignalIds = [];
        this._monitorManager = Shell.Global.get().backend.get_monitor_manager();
        const display: Meta.Display = global.display;
        const size: [number, number] = display.get_size();
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
        this.setAspectRatio(size);
    }

    public disable(): void {
        /*
        unlock-dialog session mode is used for this extension in order be able to
        detect display changes and swap backgrounds when the user changes displays 
        while the screen is locked (e.g when docking a laptop without opening the lid)
        */

        log(`disabling ${this.metadata.name}`);
        this._connectedSignalIds!.forEach((sigId) => {
            this._monitorManager!.disconnect(sigId);
        });
        this._aspectRatio = null;
        this._monitorManager = null;
        this._connectedSignalIds = null;
        this._gsettings = undefined;
    }

    private setAspectRatio(size: [number, number]): void {
        this._aspectRatio = this.getAspectRatio(size);
    }

    private getAspectRatio(size: [number, number]): string {
        //Reduce Fraction
        const findGcd = (x: number, y: number): number => {
            return y ? findGcd(y, x % y) : x;
        };
        const gcd = findGcd(size[0], size[1]);
        const widthRatio: number = size[0] / gcd;
        const heightRatio: number = size[1] / gcd;
        return widthRatio.toString() + ":" + heightRatio.toString();
    }

    private monitorsChanged(): void {
        const display: Meta.Display = global.display;
        const size: [number, number] = display.get_size();
        const newAspectRatio = this.getAspectRatio(size);

        if (newAspectRatio === this._aspectRatio) {
            return;
        }
        this._aspectRatio = newAspectRatio;
        const profile: SwapperProfile | undefined = this.findProfile();
        if (profile === undefined) {
            log("No profile found for aspect ratio: " + this._aspectRatio);
            return;
        }
        log("Swapping to profile for aspect ratio: " + this._aspectRatio);
        this.applyProfile(profile);
    }

    private findProfile(): SwapperProfile | undefined {
        if (this._gsettings === undefined) {
            return undefined;
        }
        const profileManager = new ProfileManager(this._gsettings);
        return profileManager.getProfileForRatio(this._aspectRatio!);
    }

    private applyProfile(profile: SwapperProfile): void {
        try {
            const backgroundSettings: Gio.Settings = this.getSettings(DESKTOP_SETTINGS);

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
