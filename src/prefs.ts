import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import { ExtensionMetadata } from 'resource:///org/gnome/shell/extensions/extension.js'
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import { SwapperProfile } from "./swapperProfile.js";
import { ProfileManager } from "./profileManager.js";
import { BackgroundSwapperEditor } from "./swapperEditor.js";

const SETTINGS_SCHEMA_ID: string = "org.gnome.shell.extensions.background-swapper";

export default class Preferences extends ExtensionPreferences {
    private _gsettings?: Gio.Settings;
    private _window?: Adw.PreferencesWindow;
    private _page: Adw.PreferencesPage;
    private _prefsGroup: Adw.PreferencesGroup;
    private _prefsList: Gtk.ListBox;
    private _profileManager: ProfileManager;
    
    constructor(metadata: ExtensionMetadata) {
        super(metadata);
        this._gsettings = this.getSettings(SETTINGS_SCHEMA_ID);
        this._profileManager = new ProfileManager(this._gsettings);
        let builder = Gtk.Builder.new()
        builder.add_from_file(this.metadata.path + "/templates/prefs-window.ui");
        this._page = builder.get_object("prefsPage");
        let addButton: Gtk.Widget = builder.get_object("addButton");
        addButton.connect("clicked", this.addButtonClicked.bind(this));
        this._prefsGroup = builder.get_object("prefsGroup");
        this._prefsList = builder.get_object("prefsList");
        this.updatePrefsList();
        this._profileManager.addListener(this.updatePrefsList.bind(this));
    }

    public fillPreferencesWindow(window: Adw.PreferencesWindow): void {
        this._window = window;
        window.add(this._page);
    }

    private createRow(profile: SwapperProfile): Adw.ActionRow {
        const row: Adw.ActionRow = new Adw.ActionRow();
        row.set_title(profile.getName());
        const subtitle =
            profile.getAspectRatio() +
            " - " +
            profile.getBackgroundStyleAsString() +
            ": " +
            profile.getBackgroundFilename();
        row.set_subtitle(subtitle);
        const editButton: Gtk.Button = Gtk.Button.new_from_icon_name("edit-symbolic");
        editButton.set_margin_top(8);
        editButton.set_margin_bottom(8);
        editButton.connect("clicked", this.editButtonClicked.bind(this, profile));
        row.add_suffix(editButton);
        const delButton: Gtk.Button = Gtk.Button.new_from_icon_name("app-remove-symbolic");
        delButton.set_margin_top(8);
        delButton.set_margin_bottom(8);
        delButton.add_css_class("destructive-action");
        delButton.connect("clicked", this.deleteButtonClicked.bind(this, profile));
        row.add_suffix(delButton);
        return row;
    }

    public getWindow(): Adw.PreferencesWindow | undefined {
        return this._window;
    }

    public updatePrefsList(): void {
        const newList: Gtk.ListBox = new Gtk.ListBox();
        const profiles: Map<string, SwapperProfile> = this._profileManager.getProfiles();
        if (profiles.size > 0) {
            profiles.forEach((p) => {
                newList.append(this.createRow(p));
            });
        } else {
            const emptyRow = new Adw.ActionRow();
            emptyRow.set_subtitle("No Preferences Configured");
            newList.append(emptyRow);
        }
        this._prefsGroup.remove(this._prefsList);
        this._prefsGroup.add(newList);
        this._prefsList = newList;
    }

    public addButtonClicked(): void {
        if (this._window == undefined) {
            log("window not set");
            return;
        }
        new BackgroundSwapperEditor(this, this._profileManager);
    }

    public editButtonClicked(profile: SwapperProfile): void {
        if (this._window == undefined) {
            log("window not set");
            return;
        }
        new BackgroundSwapperEditor(this, this._profileManager, profile);
    }

    public deleteButtonClicked(profile: SwapperProfile): void {
        this._profileManager.removeProfile(profile);
    }
}
