import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import { SwapperProfile } from './swapperProfile.js';

type Listener = (...args: any[]) => boolean | void;
type SerializedProfile = [string, number, number, number, string];

export class ProfileManager {
    private _settings: Gio.Settings;
    private _profiles: Map<string, SwapperProfile>;
    private _listeners: Set<Listener> = new Set<Listener>();

    constructor(settings: Gio.Settings) {
        this._settings = settings;
        const profilesArray: SerializedProfile[] = settings.get_value("profiles").deepUnpack();
        this._profiles = this.deserializeProfiles(profilesArray);
    }

    private deserializeProfiles(arr: SerializedProfile[]): Map<string, SwapperProfile> {
        let profiles: Map<string, SwapperProfile> = new Map<string, SwapperProfile>();
        arr.forEach(function (e) {
            const p = new SwapperProfile(e[0], e[1], e[2], e[3], e[4]);
            profiles.set(p.getAspectRatio(), p);
        });
        return profiles;
    }

    private serializeProfiles(): SerializedProfile[] {
        let profilesArray: SerializedProfile[] = new Array<SerializedProfile>(this._profiles.size);
        let i = 0;
        this._profiles.forEach(function (e) {
            profilesArray[i] = e.serialize();
            i++;
        });
        return profilesArray;
    }

    private notify() {
        this._listeners.forEach(function (listener) {
            listener();
        });
    }

    public getProfiles(): Map<string, SwapperProfile> {
        return this._profiles;
    }

    public addListener(callback: Listener): void {
        this._listeners.add(callback);
    }

    public getProfileForRatio(ratio: string): SwapperProfile | undefined {
        return this._profiles.get(ratio);
    }

    public addProfile(profile: SwapperProfile): void {
        this._profiles.set(profile.getAspectRatio(), profile);
        const profiles: SerializedProfile[] = this.serializeProfiles();
        const value: GLib.Variant = new GLib.Variant("a(suuus)", profiles);
        this._settings.set_value("profiles", value);
        this.notify();
    }

    public removeProfile(profile: SwapperProfile): void {
        this._profiles.delete(profile.getAspectRatio());
        const profiles: SerializedProfile[] = this.serializeProfiles();
        const value: GLib.Variant = new GLib.Variant("a(suuus)", profiles);
        this._settings.set_value("profiles", value);
        this.notify();
    }
}
