const valid = require('../utils/validate')

const CONDITIONALS = ['$or', '$and', '$not'];
const isClause = key => !CONDITIONALS.includes(key);

class Where {
  constructor (schema) {
    this.schema = schema
    this.where = {}
  }

  add (opts) {
    if (valid.getType(opts) === 'string') {
      this.where.RAW = opts
      return this
    }
    this.where = opts
    return this;
  }

  build () {
    if (this.where.RAW) {
      return this.where.RAW
    }
    try {
      return {
        ...this.buildConditionals(),
        ...this.buildClauses()
      }
    } catch (e) {
      return e
    }
  }

  buildClauses () {
    const unmappedClauses = Object.keys(this.where).filter(isClause)
    const mappedClauseKeys = this.schema.mapFields(unmappedClauses)
    return mappedClauseKeys.reduce(
      (mappedClause, key, idx) => {
        mappedClause[key] = this.where[unmappedClauses[idx]]
        return mappedClause
      },
      {}
    )
  }

  buildConditionals() {
    return Object.keys(this.where).reduce((acc, key) => {
      if(isClause(key)) return;
      acc[key] = this.where[key].map(cond => {
        return new this.constructor(this.schema).add(cond).build();
      })
      return acc;
    }, {})
  }
}

module.exports = Where
