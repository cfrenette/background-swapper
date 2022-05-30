const ExtensionUtils = imports.misc.extensionUtils;
//@ts-ignore: Used for import after transpilation
const Me = ExtensionUtils.getCurrentExtension();

const { Adw, Gtk } = imports.gi;

import * as se from "swapperEditor";
import * as pm from "profileManager";
import * as sp from "swapperProfile";

const SETTINGS_SCHEMA_ID: string = "org.gnome.shell.extensions.background-swapper";
const TEMPLATES_DIR: string = Me.dir.get_child("templates").get_path();

// @ts-ignore: Called by GJS API
function init() {}

//@ts-ignore: Called by GJS API
function fillPreferencesWindow(window: Adw.PreferencesWindow): void {
    let prefs: Preferences = new Preferences(window);
    let page: Adw.PreferencesPage = prefs.getPage();
    window.add(page);
}

class Preferences {
    private _window: Adw.PreferencesWindow;
    private _page: Adw.PreferencesPage;
    private _prefsGroup: Adw.PreferencesGroup;
    private _prefsList: Gtk.ListBox;
    private _profileManager: pm.ProfileManager;

    constructor(window: Adw.PreferencesWindow) {
        this._profileManager = new pm.ProfileManager(
            ExtensionUtils.getSettings(SETTINGS_SCHEMA_ID)
        );
        this._window = window;
        let builder = Gtk.Builder.new();
        builder.add_from_file(TEMPLATES_DIR + "/prefs-window.ui");
        this._page = builder.get_object("prefsPage");
        let addButton: Gtk.Widget = builder.get_object("addButton");
        addButton.connect("clicked", this.addButtonClicked.bind(this));
        this._prefsGroup = builder.get_object("prefsGroup");
        this._prefsList = builder.get_object("prefsList");
        this.updatePrefsList();
        this._profileManager.addListener(this.updatePrefsList.bind(this));
    }

    private createRow(profile: sp.SwapperProfile): Adw.ActionRow {
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

    public updatePrefsList(): void {
        const newList: Gtk.ListBox = new Gtk.ListBox();
        const profiles: Map<string, sp.SwapperProfile> = this._profileManager.getProfiles();
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

    getPage(): Adw.PreferencesPage {
        return this._page;
    }

    public addButtonClicked(): void {
        new se.BackgroundSwapperEditor(this._window, this._profileManager);
    }

    public editButtonClicked(profile: sp.SwapperProfile): void {
        new se.BackgroundSwapperEditor(this._window, this._profileManager, profile);
    }

    public deleteButtonClicked(profile: sp.SwapperProfile): void {
        this._profileManager.removeProfile(profile);
    }
}
