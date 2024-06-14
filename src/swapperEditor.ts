import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import GDesktopEnums from 'gi://GDesktopEnums'

import Preferences from "./prefs.js";
import { SwapperProfile } from "./swapperProfile.js";
import { ProfileManager } from "./profileManager.js";

export class BackgroundSwapperEditor {
    private _parent?: Adw.PreferencesWindow;
    private _window: Gtk.Window;
    private _profileManager: ProfileManager;

    private _textEntry: Adw.EntryRow;
    private _widthButton: Gtk.SpinButton;
    private _heightButton: Gtk.SpinButton;
    private _styleDropdown: Adw.ComboRow;
    private _fileChooserButton: Gtk.Button;
    private _fileChooserRow: Adw.ActionRow;
    private _fileChooser: Gtk.Window;
    private _updateProfile: SwapperProfile | undefined;

    constructor(
        preferences: Preferences,
        profileManager: ProfileManager,
        profile?: SwapperProfile
    ) {
        this._parent = preferences.getWindow();
        this._profileManager = profileManager;
        this._updateProfile = profile;

        const builder: Gtk.Builder = Gtk.Builder.new()
        builder.add_from_file(preferences.metadata.path + "/templates/editor-window.ui");
        this._window = builder.get_object("editor") as Gtk.Dialog;

        if (typeof this._updateProfile !== "undefined") {
            const title = "Edit Profile - " + this._updateProfile.getName();
            this._window.set_title(title);
        } else {
            this._window.set_title("Add New Profile");
        }

        const cancelButton: Gtk.Widget = builder.get_object("cancelButton");
        cancelButton.connect("clicked", this.cancelClicked.bind(this));

        const applyButton: Gtk.Widget = builder.get_object("applyButton");
        applyButton.connect("clicked", this.applyClicked.bind(this));

        this._textEntry = builder.get_object("name") as Adw.EntryRow;
        this._widthButton = builder.get_object("width") as Gtk.SpinButton;
        this._heightButton = builder.get_object("height") as Gtk.SpinButton;
        this._styleDropdown = builder.get_object("backgroundStyle") as Adw.ComboRow;
        this._fileChooserRow = builder.get_object("fileChooserRow") as Adw.ActionRow;

        this._fileChooserButton = builder.get_object("fileChooserButton") as Gtk.Button;
        this._fileChooserButton.connect("clicked", this.selectFileButtonClicked.bind(this));

        this._fileChooser = builder.get_object("fileChooser") as Gtk.Window;
        this._fileChooser.connect("response", this.fileChosen.bind(this));

        // Default in existing settings if editing a profile
        if (typeof this._updateProfile !== "undefined") {
            this._textEntry.set_text(this._updateProfile.getName());
            this._widthButton.set_value(this._updateProfile.getWidth());
            this._heightButton.set_value(this._updateProfile.getHeight());
            this._styleDropdown.set_selected(this._updateProfile.getBackgroundStyle());
            this._fileChooserRow.set_subtitle(this._updateProfile.getBackgroundPath());
        }

        this._window.set_transient_for(this._parent);
        this._window.present();
    }

    public applyClicked(): void {
        const name: string = this._textEntry.get_text();
        const width: number = this._widthButton.get_value();
        const height: number = this._heightButton.get_value();
        const style: GDesktopEnums.BackgroundStyle = this._styleDropdown.get_selected();

        let path: string = "";
        let rowtitle = this._fileChooserRow.get_subtitle();

        if (rowtitle != null) {
            path = rowtitle;
        }

        if (typeof this._updateProfile !== "undefined") {
            this._profileManager.removeProfile(this._updateProfile);
        }

        this._profileManager.addProfile(new SwapperProfile(name, width, height, style, path));
        this._window.destroy();
    }

    public cancelClicked(): void {
        this._window.destroy();
    }

    public selectFileButtonClicked(): void {
        this._fileChooser.set_transient_for(this._window);
        this._fileChooser.show();
    }

    public fileChosen(widget: Gtk.FileChooserWidget, response: Gtk.ResponseType): void {
        if (response != Gtk.ResponseType.ACCEPT) {
            return;
        }
        let path: string = ""; 
        let file = widget.get_file();
        if (file != null) {
            let maybe_path = file.get_uri();
            if (maybe_path != null)
                path = maybe_path;
        }
        this._fileChooserRow.set_subtitle(path);
    }
}
