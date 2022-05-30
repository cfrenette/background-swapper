declare namespace Adw {
    interface PreferencesPage {}

    interface PreferencesGroup extends Gtk.Widget {
        add(child: Gtk.Widget): void;
        remove(child: Gtk.Widget): void;
    }

    interface PreferencesWindow extends Gtk.Window {
        add(page: PreferencesPage): void;
    }

    interface PreferencesRow extends Gtk.ListBoxRow {
        get_title(): string;
        set_title(title: string): void;
    }

    interface ActionRow extends PreferencesRow {
        set_subtitle(subtitle: string): void;
        get_subtitle(): string;
        add_suffix(widget: Gtk.Widget): void;
    }

    interface EntryRow extends Gtk.Editable, Gtk.ListBoxRow {
        set_show_apply_button(show: boolean): void;
    }

    interface ComboRow extends Gtk.DropDown {}
}
