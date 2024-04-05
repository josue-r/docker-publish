/**
 * Provides criteria for filtering organizational resources by parent when querying for a specific resource type.
 * The criteria will be generated in to following format: {companyCode}>{regionCode}>{marketCode}>{areaCode}
 * where each resource type can only be filtered by the resources above it.
 *
 * @example
 * If searching for a Region by Company, ResourceFilterCriteria.byCompany('VAL') => 'VAL'
 * If searching for a Market by Region, ResourceFilterCriteria.byRegion('VAL', '900') => 'VAL>900'
 * ...
 * If searching for a Store by Area, ResourceFilterCriteria.byArea('VAL', '900', '910', '120') => 'VAL>900>910>120'
 */
export class ResourceFilterCriteria {
    /** Criteria string to be used when filtering organizational resources by a parent. */
    readonly criteria: string;

    constructor(criteria: codeOrEntity[]) {
        this.criteria = criteria.map((c) => (typeof c === 'string' ? c : c.code)).join('>');
    }

    /** Creates criteria for searching an organizational resource by Company. */
    static byCompany(company: codeOrEntity): ResourceFilterCriteria {
        return new ResourceFilterCriteria([company]);
    }
    /** Creates criteria for searching an organizational resource by Region. */
    static byRegion(company: codeOrEntity, region: codeOrEntity): ResourceFilterCriteria {
        return new ResourceFilterCriteria([company, region]);
    }
    /** Creates criteria for searching an organizational resource by Market. */
    static byMarket(company: codeOrEntity, region: codeOrEntity, market: codeOrEntity): ResourceFilterCriteria {
        return new ResourceFilterCriteria([company, region, market]);
    }
    /** Creates criteria for searching an organizational resource by Area. */
    static byArea(
        company: codeOrEntity,
        region: codeOrEntity,
        market: codeOrEntity,
        area: codeOrEntity
    ): ResourceFilterCriteria {
        return new ResourceFilterCriteria([company, region, market, area]);
    }
}

/** Code or entity with a code type. */
type codeOrEntity = string | { code?: string };
