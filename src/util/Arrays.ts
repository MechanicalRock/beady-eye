export const flatten = (arr: Array<any>) => {
    if (arr.length == 0) {
        return []
    }

    return arr.reduce((item, toFlatten) => {
        let rest = Array.isArray(toFlatten) ? this.flatten(toFlatten) : toFlatten
        let arr = item instanceof Array ? item : [item]
        return arr.concat(rest)
    })
}