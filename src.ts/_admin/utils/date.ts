
function repeat(c: string, length: number): string {
    if (c.length === 0) { throw new Error("too short"); }
    while(c.length < length) { c += c; }
    return c.substring(0, length);
}

function zpad(value: number, length?: number): string {
    if (length == null) { length = 2; }
    const str = String(value);
    return repeat("0", length - str.length) + str;
}

function getDate(date: Date): string {
    return [
        date.getFullYear(),
        zpad(date.getMonth() + 1),
        zpad(date.getDate())
    ].join("-");
}

export function getDateTime(date: Date): string {
    return getDate(date) + " " + [
        zpad(date.getHours()) ,
        zpad(date.getMinutes() + 1)
    ].join(":");
}
