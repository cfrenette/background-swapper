const ExtensionUtils = imports.misc.extensionUtils;
//@ts-ignore: Used for import after transpilation
const Me = ExtensionUtils.getCurrentExtension();

const { Gio, GDesktopEnums } = imports.gi;

export class SwapperProfile {
    private _name: string;
    private _widthRatio!: number;
    private _heightRatio!: number;
    private _backgroundStyle: GDesktopEnums.BackgroundStyle;
    private _path: string;

    constructor(
        name: string,
        width: number,
        height: number,
        style: GDesktopEnums.BackgroundStyle,
        path: string
    ) {
        this._name = name;
        this.setAspectRatio(width, height);
        this._backgroundStyle = style;
        this._path = path;
    }

    private setAspectRatio(width: number, height: number): void {
        //Reduce Fraction
        const findGcd = (a: number, b: number): number => {
            return b ? findGcd(b, a % b) : a;
        };
        const gcd = findGcd(width, height);
        this._widthRatio = width / gcd;
        this._heightRatio = height / gcd;
    }

    public getName(): string {
        return this._name;
    }

    public getWidth(): number {
        return this._widthRatio;
    }

    public getHeight(): number {
        return this._heightRatio;
    }

    public getAspectRatio(): string {
        return this._widthRatio.toString() + ":" + this._heightRatio.toString();
    }

    public getBackgroundFile(): Gio.File {
        return Gio.File.new_for_path(this._path);
    }

    public getBackgroundPath(): string {
        return this._path;
    }

    public getBackgroundFilename(): string {
        const startIndex = this._path.lastIndexOf("/") + 1;
        const endIndex = this._path.length;
        return this._path.substring(startIndex, endIndex);
    }

    public getBackgroundStyle(): GDesktopEnums.BackgroundStyle {
        return this._backgroundStyle;
    }

    public getBackgroundStyleAsString(): string {
        switch (this._backgroundStyle) {
            case GDesktopEnums.BackgroundStyle.NONE:
                return "None";
            case GDesktopEnums.BackgroundStyle.WALLPAPER:
                return "Wallpaper";
            case GDesktopEnums.BackgroundStyle.CENTERED:
                return "Centered";
            case GDesktopEnums.BackgroundStyle.SCALED:
                return "Scaled";
            case GDesktopEnums.BackgroundStyle.STRETCHED:
                return "Stretched";
            case GDesktopEnums.BackgroundStyle.ZOOM:
                return "Zoom";
            case GDesktopEnums.BackgroundStyle.SPANNED:
                return "Spanned";
            default:
                throw new Error("Invalid Background Style Selection");
        }
    }

    public serialize(): [string, number, number, number, string] {
        const preference: [string, number, number, number, string] = [
            this._name,
            this._widthRatio,
            this._heightRatio,
            this._backgroundStyle,
            this._path,
        ];
        return preference;
    }
}
