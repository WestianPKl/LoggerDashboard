import Sequelize from 'sequelize'
const Op = Sequelize.Op

const opMap = {
    $or: Op.or,
    $and: Op.and,
    $like: Op.like,
    $between: Op.between,
    $in: Op.in,
    $eq: Op.eq,
    $ne: Op.ne,
    $is: Op.is,
    $not: Op.not,
    $gte: Op.gte,
    $gt: Op.gt,
    $lt: Op.lt,
    $lte: Op.lte,
    $col: Op.col,
}

export function decodeSequelizeQuery(queryObject = {}) {
    if (Array.isArray(queryObject)) {
        return queryObject.map((item) => decodeSequelizeQuery(item))
    }
    if (typeof queryObject !== 'object' || queryObject === null) {
        return queryObject
    }

    let result = {}
    for (const key in queryObject) {
        const value = queryObject[key]

        if (opMap[key]) {
            result[opMap[key]] = decodeSequelizeQuery(value)
        } else if (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)
        ) {
            result[key] = {}
            for (const subKey in value) {
                if (opMap[subKey]) {
                    result[key][opMap[subKey]] = decodeSequelizeQuery(
                        value[subKey]
                    )
                } else {
                    result[key][subKey] = decodeSequelizeQuery(value[subKey])
                }
            }
        } else {
            result[key] = decodeSequelizeQuery(value)
        }
    }
    return result
}
