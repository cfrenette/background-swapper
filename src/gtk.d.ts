declare namespace Gtk {
    export enum FileChooserAction {
        OPEN = 0,
        SAVE = 1,
        SELECT_FOLDER = 2,
    }

    export enum ResponseType {
        NONE = -1,
        REJECT = -2,
        ACCEPT = -3,
        DELETE_EVENT = -4,
        OK = -5,
        CANCEL = -6,
        CLOSE = -7,
        YES = -8,
        NO = -9,
        APPLY = -10,
        HELP = -11,
    }

    export interface Widget extends GObject.Object {
        set_margin_top(margin: number): void;
        set_margin_bottom(margin: number): void;
    }

    export interface Window extends Widget {
        show(): void;
        destroy(): void;
        set_transient_for(parent: Window): void;
        set_title(title: string): void;
        present(): void;
    }

    export interface Editable {
        get_text(): string;
        set_text(text: string): void;
    }

    export interface Dialog extends Window {}

    export interface ListBox extends Widget {
        append(child: Widget): void;
    }

    export interface ListBoxRow extends Gtk.Widget {
        get_child(): Gtk.Widget;
        set_child(child: Gtk.Widget): void;
    }

    export interface SpinButton extends Widget {
        get_value(): number;
        set_value(value: number): void;
    }

    export interface DropDown extends Widget {
        get_selected(): number;
        set_selected(position: number): void;
    }

    export interface FileChooserWidget extends Widget {
        get_file(): Gio.File;
    }

    export interface Button extends Widget {
        add_css_class(cssClass: string): void;
        get_label(): string;
        set_label(label: string): void;
        new_from_icon_name(iconName: string): Button;
    }

    export interface Builder {
        add_from_file(path: string): boolean;
        get_object(id: string): Widget;
    }
}
