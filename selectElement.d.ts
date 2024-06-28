// querySelector may return null, which is annoying,
// so I use this instead for full typechecking support
export function selectElement<T extends typeof Element>(
    selector: string,
    elementType: T,
): T["prototype"];