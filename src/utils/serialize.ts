import * as util from "util";

export function serialize(item: any, json = false) {
    const serializer: (target: any) => string = json ? JSON.stringify : util.inspect;
    return typeof item === "string" ? item : serializer(item);
}
